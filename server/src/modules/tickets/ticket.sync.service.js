const db = require("../../config/db");
const { getHisenseServiceOrder } = require("../../integrations/hisense/hisense.soap");

function sanitizeSapDate(dateValue) {
    if (!dateValue) return null;

    // Remove whitespace
    const dateStr = dateValue.toString().trim();

    // Invalid SAP values
    if (
        dateStr === '0000-00-00' ||
        dateStr === '00000000' ||
        dateStr === '0' ||
        dateStr === ''
    ) {
        return null;
    }

    return dateStr;
}

function normalizeRemark(text) {
    if (!text) return '';

    return text
        .toString()
        .trim()                    // remove leading/trailing spaces
        .replace(/\s+/g, ' ')      // collapse multiple spaces
        .toLowerCase();            // optional: case-insensitive compare
}

function formatSapDate(dateStr) {
    if (!dateStr) return null;
    return `${dateStr.slice(0,4)}-${dateStr.slice(4,6)}-${dateStr.slice(6,8)}`;
}

exports.syncServiceOrdersFromSAP = async (payload) => {

    const connection = await db.getConnection();

    try {

        await connection.beginTransaction();

        const soapResponse = await getHisenseServiceOrder(payload);

        if (!soapResponse || soapResponse?.data.MSG_TYPE !== 'S') {
            return { success: false, message: "SOAP failed" };
        }

        let serviceOrders = soapResponse?.data.HEAD;

        if (!serviceOrders) {
            return { success: true, message: "No records found" };
        }

        if (!Array.isArray(serviceOrders)) {
            serviceOrders = [serviceOrders];
        }

        const objectIds = serviceOrders.map(o => o.OBJECT_ID);

        const [localTickets] = await connection.query(
            `SELECT id, ticket_number, external_ticket_number
       FROM tickets
       WHERE external_ticket_number IN (?)`,
            [objectIds]
        );

        const ticketMap = new Map(
            localTickets.map(t => [t.external_ticket_number, t])
        );

        for (const order of serviceOrders) {

            try {

                if (order.ORDER_TYPE !== 'ZSV1') continue;

                const ticket = ticketMap.get(order.OBJECT_ID);
                if (!ticket) continue;

                const ticketId = ticket.id;

                /* ---------------- OLD PAYLOAD ---------------- */

                const [[oldTicket]] = await connection.execute(
                    `SELECT * FROM tickets WHERE id=? LIMIT 1`,
                    [ticketId]
                );

                const [logResult] = await connection.execute(
                    `INSERT INTO sap_update_log
           (ticket_id,ticket_number,external_ticket_number,source,old_payload,sap_payload,status)
           VALUES (?,?,?,?,?,?,?)`,
                    [
                        ticketId,
                        oldTicket?.ticket_number || null,
                        order.OBJECT_ID,
                        'SYNC',
                        JSON.stringify(oldTicket),
                        JSON.stringify(order),
                        'PENDING'
                    ]
                );

                const logId = logResult.insertId;

                /* ---------------- CURRENT STATE ---------------- */

                const [[currentTicket]] = await connection.execute(
                    `SELECT 
              t.current_status_id,
              t.current_stage_id,
              t.agent_remarks,
              t.assign_date,
              t.customer_product_id,
              cp.product_id,
              cp.serial_no,
              cp.purchase_date
           FROM tickets t
           JOIN customer_products cp
           ON cp.id = t.customer_product_id
           WHERE t.id=?
           LIMIT 1`,
                    [ticketId]
                );

                if (!currentTicket) continue;

                /* ---------------- MASTER RESOLUTION ---------------- */

                const [[statusRow]] = await connection.execute(
                    `SELECT id FROM status_master WHERE status_code=? LIMIT 1`,
                    [order.ORDER_STATUS]
                );

                if (!statusRow) continue;

                let stageId = null;

                if (order.IN_PROGRESS) {

                    const [[stageRow]] = await connection.execute(
                        `SELECT id FROM stage_master WHERE stage_code=? LIMIT 1`,
                        [order.IN_PROGRESS]
                    );

                    stageId = stageRow?.id || null;

                }

                let customerModelId = null;

                if (order.CUSTOMER_MODEL) {

                    const [[modelRow]] = await connection.execute(
                        `SELECT id 
             FROM customer_models
             WHERE model_number=? AND status='ACTIVE'
             LIMIT 1`,
                        [order.CUSTOMER_MODEL]
                    );

                    customerModelId = modelRow?.id || null;

                }

                let productId = null;

                if (order.PRODUCT_ID) {

                    let query = `
            SELECT id
            FROM product_ids
            WHERE product_code=? AND status='ACTIVE'
          `;

                    let params = [order.PRODUCT_ID];

                    if (customerModelId) {
                        query += ` AND customer_model_id=?`;
                        params.push(customerModelId);
                    }

                    query += ` LIMIT 1`;

                    const [[productRow]] = await connection.execute(query, params);

                    productId = productRow?.id || null;

                }

                // const newAssignDate = sanitizeSapDate(order.ASSIGN_DATE);
                const newAssignDate = formatSapDate(order.ASSIGN_DATE);
                const newPurchaseDate = sanitizeSapDate(order.PURCHASE_DATE);

                /* ---------------- CHANGE DETECTION ---------------- */

                const statusChanged =
                    currentTicket.current_status_id !== statusRow.id;

                const stageChanged =
                    currentTicket.current_stage_id !== stageId;

                const remarkChanged =
                    normalizeRemark(currentTicket.agent_remarks) !==
                    normalizeRemark(order.PROBLEM_NOTE);

                const productChanged =
                    productId && currentTicket.product_id !== productId;

                const serialChanged =
                    (currentTicket.serial_no || '') !== (order.SERIALNO || '');

                const purchaseChanged =
                    newPurchaseDate &&
                    currentTicket.purchase_date?.toISOString().slice(0, 10) !== newPurchaseDate;

                const assignDateChanged =
                    newAssignDate &&
                    currentTicket.assign_date?.toISOString().slice(0, 10) !== newAssignDate;

                /* ---------------- NO CHANGE ---------------- */

                if (!(statusChanged || stageChanged || remarkChanged ||
                    productChanged || serialChanged ||
                    purchaseChanged || assignDateChanged)) {

                    await connection.execute(
                        `UPDATE sap_update_log
             SET status='NO_CHANGE', updated_at=NOW()
             WHERE id=?`,
                        [logId]
                    );

                    continue;
                }

                /* ---------------- UPDATE TICKETS ---------------- */

                if (statusChanged || stageChanged || remarkChanged || assignDateChanged) {

                     const oldAssignDate = currentTicket.assign_date
        ? currentTicket.assign_date.toISOString().slice(0, 10)
        : null;

    console.log("===== SAP UPDATE TRIGGERED =====");
    console.log("Ticket:", ticketId, "SAP Order:", order.OBJECT_ID);

    console.log("statusChanged:", statusChanged, {
        old: currentTicket.current_status_id,
        new: statusRow.id
    });

    console.log("stageChanged:", stageChanged, {
        old: currentTicket.current_stage_id,
        new: stageId
    });

    console.log("remarkChanged:", remarkChanged, {
        old_raw: currentTicket.agent_remarks,
        new_raw: order.PROBLEM_NOTE,
        old_normalized: normalizeRemark(currentTicket.agent_remarks),
        new_normalized: normalizeRemark(order.PROBLEM_NOTE)
    });

    console.log("assignDateChanged:", assignDateChanged, {
        old: oldAssignDate,
        new: newAssignDate
    });

    console.log("================================");

                    await connection.execute(
                        `UPDATE tickets
             SET current_status_id=?,
                 current_stage_id=?,
                 agent_remarks=?,
                 assign_date=COALESCE(?,assign_date),
                 updated_at=NOW()
             WHERE id=?`,
                        [
                            statusRow.id,
                            stageId,
                            order.PROBLEM_NOTE || null,
                            newAssignDate,
                            ticketId
                        ]
                    );

                    await connection.execute(
                        `INSERT INTO ticket_history
             (ticket_id,status_id,stage_id,remarks,changed_by)
             VALUES (?,?,?,?,?)`,
                        [
                            ticketId,
                            statusRow.id,
                            stageId,
                            order.PROBLEM_NOTE || null,
                            3
                        ]
                    );

                }

                /* ---------------- UPDATE PRODUCT ---------------- */

                if (productChanged || serialChanged || purchaseChanged) {

                    await connection.execute(
                        `UPDATE customer_products
             SET product_id=COALESCE(?,product_id),
                 serial_no=COALESCE(?,serial_no),
                 purchase_date=COALESCE(?,purchase_date),
                 updated_at=NOW()
             WHERE id=?`,
                        [
                            productChanged ? productId : null,
                            serialChanged ? order.SERIALNO : null,
                            purchaseChanged ? newPurchaseDate : null,
                            currentTicket.customer_product_id
                        ]
                    );

                }

                /* ---------------- NEW PAYLOAD ---------------- */

                const [[newTicket]] = await connection.execute(
                    `SELECT * FROM tickets WHERE id=? LIMIT 1`,
                    [ticketId]
                );

                await connection.execute(
                    `UPDATE sap_update_log
           SET new_payload=?,
               status='UPDATED',
               updated_at=NOW()
           WHERE id=?`,
                    [
                        JSON.stringify(newTicket),
                        logId
                    ]
                );

            } catch (err) {

                console.error("SAP Sync Error:", err.message);

                await connection.execute(
                    `UPDATE sap_update_log
           SET status='FAILED',
               error_message=?,
               updated_at=NOW()
           WHERE id=?`,
                    [err.message, logId]
                );

            }

        }

        await connection.commit();

        return { success: true };

    } catch (err) {

        await connection.rollback();
        throw err;

    } finally {

        connection.release();

    }

};