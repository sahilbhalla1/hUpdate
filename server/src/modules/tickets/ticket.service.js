const db = require("../../config/db");
const ATTACHMENT_RULES = require('./attachment.rules');
const ATTACHMENT_CONFIG = require('./attachment.config');

const { createHisenseOrder, updateHisenseOrder, getHisenseServiceOrder } = require("../../integrations/hisense/hisense.soap");
const { mapFrontendToDb, mapDbToSoap, mapDbToSoapUpdate } = require("../../utils/mappingTicketPayload")

function getTicketPrefix(orderTypeCode) {
  switch (orderTypeCode) {
    case 'ZSV1':
      return 'SR';
    case 'ZWO3':
      return 'CO';
    case 'ZWO4':
      return 'CS';
    default:
      return 'TK';
  }
}

// function generateTicketNumber() {
//   const now = new Date();

//   const yyyy = now.getFullYear();
//   const mm = String(now.getMonth() + 1).padStart(2, '0');
//   const dd = String(now.getDate()).padStart(2, '0');

//   const yyyymmdd = `${yyyy}${mm}${dd}`;
//   const random = Math.floor(Math.random() * 1000).toString().padStart(4, '0');

//   return `Sp${yyyymmdd}${random}`;
// }

function generateTicketNumber(insertId, orderTypeCode) {
  const prefix = getTicketPrefix(orderTypeCode);

  const today = new Date()
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, '');

  const last4 = String(insertId % 10000).padStart(4, '0');

  return `${prefix}${today}-${last4}`;
}

async function resolveStatusByCode(connection, statusCode, orderTypeCode) {

  if (!statusCode) {
    throw new Error('statusCode is required');
  }

  const [rows] = await connection.execute(
    `SELECT id
     FROM status_master
     WHERE status_code = ?
     and order_type=?
     LIMIT 1`,
    [statusCode, orderTypeCode]
  );

  if (!rows.length) {
    throw new Error(`Status ${statusCode} not found`);
  }

  return rows[0].id;
}

async function resolveConsultingTypeByCode(connection, code,consulting_type_name) {
  const [rows] = await connection.execute(
    `SELECT id 
     FROM consulting_type_master
     WHERE consulting_type_code = ? AND consulting_type_name=?
     AND status = 'ACTIVE'
     LIMIT 1`,
    [code,consulting_type_name]
  );

  if (!rows.length) {
    throw new Error(`Consulting type ${code} not found`);
  }

  return rows[0].id;
}

async function resolveOrderType(connection, orderTypeCode) {
  const [rows] = await connection.execute(
    `SELECT id FROM order_type_master WHERE order_type = ? LIMIT 1`,
    [orderTypeCode]
  );

  if (!rows.length) throw new Error('Invalid order type');
  return rows[0].id;
}

async function resolveConsultingType(connection, orderTypeCode, consultingTypeCode,consultingType) {
  if (orderTypeCode !== 'ZWO4') return null;

  if (!consultingTypeCode) {
    throw new Error('consultingTypeCode is required for Consulting');
  }

  const [rows] = await connection.execute(
    `SELECT id FROM consulting_type_master
     WHERE consulting_type_code = ? AND consulting_type_name = ? AND status = 'ACTIVE'
     LIMIT 1`,
    [consultingTypeCode,consultingType]
  );

  if (!rows.length) {
    throw new Error('Invalid consulting type');
  }

  return rows[0].id;
}

async function resolveComplaintType(connection, orderTypeCode, complaintTypeCode) {
  if (orderTypeCode !== 'ZWO3') return null;

  if (!complaintTypeCode) {
    throw new Error('complaintTypeCode is required for Complaint');
  }

  const [rows] = await connection.execute(
    `SELECT id FROM complaint_type_master
     WHERE complaint_type_code = ? AND status = 'ACTIVE'
     LIMIT 1`,
    [complaintTypeCode]
  );

  if (!rows.length) {
    throw new Error('Invalid complaint type');
  }

  return rows[0].id;
}

function validateCustomer(data) {

  const required = [
    'firstName',
    'primaryPhone',
    'zipCode',
    'city',
    'province',
    'addressLine1'
  ];

  for (const field of required) {
    if (data[field] === undefined || data[field] === null) {
      throw new Error(`Customer ${field} is required`);
    }
  }
}

function normalizeCustomer(data) {
  return {
    title: data.title ?? null,
    firstName: data.firstName?.trim(),
    lastName: data.lastName?.trim() ?? null,
    companyName: data.companyName ?? null,
    primaryPhone: data.primaryPhone?.trim(),
    alternatePhone: data.alternatePhone ?? null,
    email: data.email?.toLowerCase() ?? null,
    countryCode: data.countryCode ?? 'IN',
    zipCode: data.zipCode?.trim(),
    city: data.city?.trim(),
    province: data.province?.trim(),
    addressLine1: data.addressLine1?.trim(),
    addressLine2: data.addressLine2 ?? null,
    addressLine3: data.addressLine3 ?? null,
    buildingCode: data.buildingCode ?? null,
    socialX: data.socialX ?? null,
    socialFacebook: data.socialFacebook ?? null,
    socialLinkedin: data.socialLinkedin ?? null,
    socialInstagram: data.socialInstagram ?? null,
    socialYoutube: data.socialYoutube ?? null
  };
}

async function updateCustomerById(connection, customerId, rawData) {

  validateCustomer(rawData);
  const data = normalizeCustomer(rawData);

  await connection.execute(
    `UPDATE customers SET
      title = COALESCE(?, title),
      first_name = ?,
      last_name = COALESCE(?, last_name),
      company_name = COALESCE(?, company_name),
      primary_phone = ?,
      alternate_phone = COALESCE(?, alternate_phone),
      email = COALESCE(?, email),
      country_code = ?,
      zip_code = ?,
      city = ?,
      province = ?,
      address_line1 = ?,
      address_line2 = COALESCE(?, address_line2),
      address_line3 = COALESCE(?, address_line3),
      building_code = COALESCE(?, building_code),
      social_x = COALESCE(?, social_x),
      social_facebook = COALESCE(?, social_facebook),
      social_linkedin = COALESCE(?, social_linkedin),
      social_instagram = COALESCE(?, social_instagram),
      social_youtube = COALESCE(?, social_youtube),
      updated_at = NOW()
     WHERE id = ?`,
    [
      data.title,
      data.firstName,
      data.lastName,
      data.companyName,
      data.primaryPhone,
      data.alternatePhone,
      data.email,
      data.countryCode,
      data.zipCode,
      data.city,
      data.province,
      data.addressLine1,
      data.addressLine2,
      data.addressLine3,
      data.buildingCode,
      data.socialX,
      data.socialFacebook,
      data.socialLinkedin,
      data.socialInstagram,
      data.socialYoutube,
      customerId
    ]
  );
}

async function upsertCustomerByPhone(connection, rawData) {

  validateCustomer(rawData);
  const data = normalizeCustomer(rawData);

  const [existing] = await connection.execute(
    `SELECT id FROM customers WHERE primary_phone = ? LIMIT 1`,
    [data.primaryPhone]
  );

  if (existing.length) {
    await updateCustomerById(connection, existing[0].id, rawData);
    return existing[0].id;
  }

  const [result] = await connection.execute(
    `INSERT INTO customers (
      customer_code,
      user_type,
      title,
      first_name,
      last_name,
      company_name,
      primary_phone,
      alternate_phone,
      email,
      country_code,
      zip_code,
      city,
      province,
      address_line1,
      address_line2,
      address_line3,
      building_code,
      social_x,
      social_facebook,
      social_linkedin,
      social_instagram,
      social_youtube
    ) VALUES (?, 'CUSTOMER', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      `CUST-${Date.now()}`,
      data.title,
      data.firstName,
      data.lastName,
      data.companyName,
      data.primaryPhone,
      data.alternatePhone,
      data.email,
      data.countryCode,
      data.zipCode,
      data.city,
      data.province,
      data.addressLine1,
      data.addressLine2,
      data.addressLine3,
      data.buildingCode,
      data.socialX,
      data.socialFacebook,
      data.socialLinkedin,
      data.socialInstagram,
      data.socialYoutube
    ]
  );

  return result.insertId;
}

async function resolveCustomer(connection, payload) {

  if (payload.customerId) {

    const [rows] = await connection.execute(
      `SELECT id FROM customers WHERE id = ? LIMIT 1`,
      [payload.customerId]
    );

    if (!rows.length) {
      throw new Error('Customer not found');
    }

    await updateCustomerById(connection, payload.customerId, payload);
    return payload.customerId;
  }

  return await upsertCustomerByPhone(connection, payload);
}

function validateCustomerProduct(data) {
  const required = ['productId', 'purchaseChannel'];

  for (const field of required) {
    if (data[field] === undefined || data[field] === null) {
      throw new Error(`Product ${field} is required`);
    }
  }
}

function normalizeCustomerProduct(data) {
  return {
    productId: data.productId,
    warrantyTypeId: data.warrantyTypeId ?? null,
    serialNo: data.serialNo?.trim(),
    serialNoAlt: data.serialNoAlt ?? null,
    purchaseDate: data.purchaseDate ?? null,
    purchaseChannel: data.purchaseChannel,
    purchasePartner: data.purchasePartner ?? null,
    status: data.status ?? 'ACTIVE'
  };
}

async function updateCustomerProductById(connection, customerProductId, customerId, rawData) {

  validateCustomerProduct(rawData);
  const data = normalizeCustomerProduct(rawData);

  const [rows] = await connection.execute(
    `SELECT customer_id FROM customer_products WHERE id = ? LIMIT 1`,
    [customerProductId]
  );

  if (!rows.length) {
    throw new Error('Customer product not found');
  }

  if (rows[0].customer_id !== customerId) {
    throw new Error('Product does not belong to this customer');
  }

  await connection.execute(
    `UPDATE customer_products SET
      product_id = ?,
      warranty_type_id = COALESCE(?, warranty_type_id),
      serial_no = ?,
      serial_no_alt = COALESCE(?, serial_no_alt),
      purchase_date = COALESCE(?, purchase_date),
      purchase_channel = ?,
      purchase_partner = COALESCE(?, purchase_partner),
      status = ?,
      updated_at = NOW()
     WHERE id = ?`,
    [
      data.productId,
      data.warrantyTypeId,
      data.serialNo,
      data.serialNoAlt,
      data.purchaseDate,
      data.purchaseChannel,
      data.purchasePartner,
      data.status,
      customerProductId
    ]
  );
}

async function resolveCustomerProduct(connection, customerId, payload) {

  if (payload.customerProductId) {
    await updateCustomerProductById(
      connection,
      payload.customerProductId,
      customerId,
      payload
    );

    return payload.customerProductId;
  }

  validateCustomerProduct(payload);
  const data = normalizeCustomerProduct(payload);

  const [result] = await connection.execute(
    `INSERT INTO customer_products (
      customer_id,
      product_id,
      warranty_type_id,
      serial_no,
      serial_no_alt,
      purchase_date,
      purchase_channel,
      purchase_partner,
      status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      customerId,
      data.productId,
      data.warrantyTypeId,
      data.serialNo,
      data.serialNoAlt,
      data.purchaseDate,
      data.purchaseChannel,
      data.purchasePartner,
      data.status
    ]
  );

  return result.insertId;
}

const normalizeInt = (value) => {
  if (value === '' || value === undefined || value === null) {
    return null;
  }
  return Number(value);
};

async function resolveStatusCodeById(connection, statusId) {
  const [rows] = await connection.execute(
    `SELECT status_code
     FROM status_master
     WHERE id = ?
     LIMIT 1`,
    [statusId]
  );

  if (!rows.length) {
    throw new Error('Invalid status ID');
  }

  return rows[0].status_code;
}

exports.createTicket = async (frontendPayload, userId, userName) => {
  const connection = await db.getConnection();

  let ticketId, ticketNumber, consultingTicketId, consultingTicketNumber,
    autoStatusId, consultingTypeCode, payload;

  try {
    await connection.beginTransaction();

    // STEP 1 — Map frontend → backend structure
    payload = mapFrontendToDb(frontendPayload);

    const customerId = await resolveCustomer(connection, payload);
    const customerProductId = await resolveCustomerProduct(connection, customerId, payload);
    const orderTypeId = await resolveOrderType(connection, payload.orderTypeCode);
    const consultingTypeId = await resolveConsultingType(connection, payload.orderTypeCode, payload.consultingTypeCode,payload.consultingType);
    const complaintTypeId = await resolveComplaintType(connection, payload.orderTypeCode, payload.complaintTypeCode);

    if (payload.stageId !== undefined && payload.stageId !== null && payload.stageId !== "") {
      const [validStage] = await connection.execute(
        `SELECT 1 FROM stage_master WHERE id = ? LIMIT 1`,
        [payload.stageId]
      );
      if (!validStage.length) throw new Error('Invalid stage for status');
    }

    // ticketNumber = generateTicketNumber();
    consultingTicketId = null;
    consultingTicketNumber = null;
    autoStatusId = null;
    consultingTypeCode = null;

    // Insert main ticket
    const [result] = await connection.execute(
      `INSERT INTO tickets (
         customer_id, customer_product_id, order_type_id,
        order_source_id, service_type_id, symptom_l1_id, symptom_l2_id,
        section_id, defect_id, repair_action_id, condition_flag,
        problem_note, agent_remarks, assign_date, consulting_type_id,
        complaint_type_id, current_status_id, current_stage_id, created_by
      ) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        customerId, customerProductId, orderTypeId,
        payload.orderSourceId,
        normalizeInt(payload.serviceTypeId) ?? null,
        normalizeInt(payload.symptom1Id) ?? null,
        normalizeInt(payload.symptom2Id) ?? null,
        normalizeInt(payload.sectionId) ?? null,
        normalizeInt(payload.defectId) ?? null,
        normalizeInt(payload.repairActionId) ?? null,
        normalizeInt(payload.conditionFlag) ?? null,
        payload.problemNote ?? null,
        payload.agentRemarks ?? null,
        payload.assignDate ?? null,
        consultingTypeId, complaintTypeId,
        payload.statusId,
        normalizeInt(payload.stageId) ?? null,
        userId
      ]
    );
    ticketId = result.insertId;

    ticketNumber = generateTicketNumber(
      ticketId,
      payload.orderTypeCode
    );
    await connection.execute(
      `UPDATE tickets SET ticket_number = ? WHERE id = ?`,
      [ticketNumber, ticketId]
    );

    await connection.execute(
      `INSERT INTO ticket_history (ticket_id, status_id, stage_id, remarks, changed_by)
       VALUES (?, ?, ?, ?, ?)`,
      [ticketId, payload.statusId, normalizeInt(payload.stageId) ?? null, payload.agentRemarks ?? null, userId]
    );

    // Auto-create consulting ticket for ZSV1 / ZWO3
    if (payload.orderTypeCode === 'ZSV1' || payload.orderTypeCode === 'ZWO3') {
      const [consultingOrderTypeRow] = await connection.execute(
        `SELECT id FROM order_type_master WHERE order_type = 'ZWO4' LIMIT 1`
      );
      if (!consultingOrderTypeRow.length) throw new Error('Consulting order type not found');

      const consultingOrderTypeId = consultingOrderTypeRow[0].id;
      consultingTypeCode = payload.orderTypeCode === 'ZSV1' ? 'W01' : 'W01';
      const resolvedConsultingTypeId = await resolveConsultingTypeByCode(connection, consultingTypeCode,"General Inquiry");
      // const resolvedConsultingTypeId = 1;
      autoStatusId = await resolveStatusByCode(connection, 'E0003', 'ZWO4');
      // consultingTicketNumber = generateTicketNumber();

      const [consultingResult] = await connection.execute(
        `INSERT INTO tickets (
          customer_id, customer_product_id, order_type_id,
          order_source_id, service_type_id, symptom_l1_id, symptom_l2_id,
          section_id, defect_id, repair_action_id, condition_flag,
          problem_note, agent_remarks, consulting_type_id, complaint_type_id,
          current_status_id, current_stage_id, created_by
        ) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          customerId, customerProductId, consultingOrderTypeId,
          payload.orderSourceId, null,
          payload.symptom1Id ?? null, payload.symptom2Id ?? null,
          payload.sectionId ?? null, payload.defectId ?? null,
          payload.repairActionId ?? null, payload.conditionFlag ?? null,
          payload.problemNote ?? null, payload.agentRemarks ?? null,
          resolvedConsultingTypeId, null,
          autoStatusId, null, userId
        ]
      );
      consultingTicketId = consultingResult.insertId;
      consultingTicketNumber = generateTicketNumber(
        consultingTicketId,
        "ZWO4"
      );

      await connection.execute(
        `UPDATE tickets SET ticket_number = ? WHERE id = ?`,
        [consultingTicketNumber, consultingTicketId]
      );

      await connection.execute(
        `INSERT INTO ticket_history (ticket_id, status_id, stage_id, remarks, changed_by)
         VALUES (?, ?, ?, ?, ?)`,
        [consultingTicketId, autoStatusId, null, payload.agentRemarks ?? null, userId]
      );
    }

    // ✅ SOAP calls — block here before commit
    const ticketsToSync = [
      {
        id: ticketId,
        ticketNumber,
        orderTypeCode: payload.orderTypeCode,
        statusId: payload.statusId,
        HEAD_FIELD1: payload.orderTypeCode === 'ZWO3' ? payload.complaintTypeCode : '',
        CREATE_USER: userName
      }
    ];

    if (consultingTicketId) {
      ticketsToSync.push({
        id: consultingTicketId,
        ticketNumber: consultingTicketNumber,
        orderTypeCode: 'ZWO4',
        HEAD_FIELD1: consultingTypeCode,
        statusId: autoStatusId,
        CREATE_USER: userName
      });
    }

    // const sapSyncResults = [];

    for (const t of ticketsToSync) {
      const statusCode = await resolveStatusCodeById(connection, t.statusId);

      const isOnlyConsulting =
        t.orderTypeCode === 'ZWO4' &&
        !(consultingTicketId && t.id === consultingTicketId);

      const soapPayload = mapDbToSoap({
        ...frontendPayload,
        SP_ORDER: t.ticketNumber,
        ORDER_TYPE_CODE: t.orderTypeCode,
        STATUS_CODE: statusCode,
        HEAD_FIELD1: isOnlyConsulting ? payload.consultingTypeCode : t.HEAD_FIELD1,
        HEAD_FIELD3: isOnlyConsulting ? 'X' : '',
        CREATE_USER: userName
      });

      let soapStatus = 'FAILED';
      let soapError = null;
      let soapResponse = null;
      let externalTicketNumber = null;

      try {
        soapResponse = await createHisenseOrder({
          payload: soapPayload,
          ticketId: t.id,
          ticketNumber: t.ticketNumber,
          orderTypeCode: t.orderTypeCode
        });

        if (soapResponse.success && soapResponse.objectId) {
          externalTicketNumber = soapResponse.objectId;
          soapStatus = 'SUCCESS';

          await connection.execute(
            `UPDATE tickets SET external_ticket_number = ? WHERE id = ?`,
            [externalTicketNumber, t.id]
          );
        } else {
          // SAP returned but without success — still "FAILED"
          soapError = soapResponse?.message || 'SAP returned without objectId';
        }
      } catch (soapErr) {
        soapError = soapErr.message;
      }

      // // Log every attempt to sap_sync_log (within same transaction)
      // await connection.execute(
      //   `INSERT INTO sap_sync_log 
      //     (ticket_id, ticket_number, order_type_code, request_payload, response_payload,
      //      external_ticket_number, status, error_message)
      //    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      //   [
      //     t.id,
      //     t.ticketNumber,
      //     t.orderTypeCode,
      //     JSON.stringify(soapPayload),
      //     JSON.stringify(soapResponse),
      //     externalTicketNumber,
      //     soapStatus,
      //     soapError
      //   ]
      // );

      // sapSyncResults.push({ ticketId: t.id, ticketNumber: t.ticketNumber, soapStatus, soapError });
    }

    // Everything succeeded — commit DB + SOAP results together
    await connection.commit();

    return {
      success: true,
      ticketId,
      ticketNumber,
      // sapSync: sapSyncResults   // frontend can inspect per-ticket SAP outcome
    };

  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

exports.updateTicketSOAP = async (ticketData) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();
    //SOAP API DATA PASS FROM HERE TO HISENSE
    const soapResponse = await updateHisenseOrder({

      OBJECT_ID: ticketData.OBJECT_ID,

      SP_ORDER: ticketData.SP_ORDER,
      ORDER_SOURCE: ticketData.ORDER_SOURCE,
      SALES_ORG: "O 50000615",
      DIS_CHANNEL: "11",
      DIVISION: "00",
      ORDER_TYPE: ticketData.ORDER_TYPE,
      ORDER_STATUS: ticketData.ORDER_STATUS,
      ACK_DATE: ticketData.ACK_DATE,
      IN_DEPOT_DATE: ticketData.IN_DEPOT_DATE,
      REPAIR_DATE: ticketData.REPAIR_DATE,
      WARRANTYPE: ticketData.WARRANTYPE,
      SERVICE_TYPE: ticketData.SERVICE_TYPE,
      IN_PROGRESS: ticketData.IN_PROGRESS,
      PROBLEM_NOTE: ticketData.PROBLEM_NOTE,
      REPAIR_NOTE: ticketData.REPAIR_NOTE,
      CAN_REASN: ticketData.CAN_REASN,

      PRODUCT_ID: ticketData.PRODUCT_ID,
      CUSTOMER_MODEL: ticketData.CUSTOMER_MODEL,
      SERIALNO: ticketData.SERIALNO,
      ZZZSERIALNO1: ticketData.ZZZSERIALNO1,
      ZZZSERIALNO2: ticketData.ZZZSERIALNO2,
      IMEI1_OLD: ticketData.IMEI1_OLD,
      IMEI2_OLD: ticketData.IMEI2_OLD,
      EXT_REF: ticketData.EXT_REF,
      PURCHASE_DATE: ticketData.PURCHASE_DATE,

      SYMPTOMS_CODE: ticketData.SYMPTOMS_CODE,
      SYMPTOMS_CODE_G: ticketData.SYMPTOMS_CODE_G,
      DEFECT_CODE: ticketData.DEFECT_CODE,
      DEFECT_CODE_G: ticketData.DEFECT_CODE_G,
      REPAIR_CODE: ticketData.REPAIR_CODE,
      REPAIR_CODE_G: ticketData.REPAIR_CODE_G,
      CONDITION_CODE: ticketData.CONDITION_CODE,
      SECTION_CODE: ticketData.SECTION_CODE,
      MBL_CLT_TYPE: ticketData.MBL_CLT_TYPE,
      PACAKGING: ticketData.PACAKGING,
      PURCHASE_INVOICE_NO: ticketData.PURCHASE_INVOICE_NO,

      SP_PARTNER: "204272",
      // SP_PARTNER: ticketData.SP_PARTNER || "200072",

      TRACKING_NO_FR_COM: ticketData.TRACKING_NO_FR_COM,
      TRACKING_NO_FR: ticketData.TRACKING_NO_FR,
      TRACKING_NO_TO_COM: ticketData.TRACKING_NO_TO_COM,
      TRACKING_NO_TO: ticketData.TRACKING_NO_TO,
      OPERATOR_CODE: ticketData.OPERATOR_CODE,
      FIRMWARE: ticketData.FIRMWARE,

      HEAD_FIELD1: ticketData.HEAD_FIELD1,
      HEAD_FIELD2: ticketData.HEAD_FIELD2,
      HEAD_FIELD3: ticketData.HEAD_FIELD3,
      HEAD_FIELD4: ticketData.HEAD_FIELD4,
      HEAD_FIELD5: ticketData.HEAD_FIELD5,

      ITEM_NUMBER: ticketData.ITEM_NUMBER,
      ITEM_PRODUCT_ID: ticketData.ITEM_PRODUCT_ID,
      ITEM_PRODUCT_DES: ticketData.ITEM_PRODUCT_DES,
      ITEM_QUANTITY: ticketData.ITEM_QUANTITY,
      ITEM_SERIAL_NO: ticketData.ITEM_SERIAL_NO,
      ITEM_CATEGORY: ticketData.ITEM_CATEGORY,
      ITEM_STATUS: ticketData.ITEM_STATUS,
      ITEM_NET_VALUE: ticketData.ITEM_NET_VALUE,
      ITEM_FIELD1: ticketData.ITEM_FIELD1,
      ITEM_FIELD2: ticketData.ITEM_FIELD2,
      ITEM_FIELD3: ticketData.ITEM_FIELD3,
      ITEM_FIELD4: ticketData.ITEM_FIELD4,
      ITEM_FIELD5: ticketData.ITEM_FIELD5,

    });

    await connection.commit();

    return { soapResponse };

  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

exports.getTickets = async ({ filter, search, status, page = 1, limit = 10 }) => {
  const offset = (page - 1) * limit;
  let whereClause = "WHERE 1=1";
  let params = [];

  let isCustomSearch = false;
  let customSearchKey = "";

  // 1. Identify Search Type
  if (search && ["name", "email", "phone"].includes(filter)) {
    isCustomSearch = true;
    const sysKeyMap = {
      name: "NAME",
      email: "EMAIL",
      phone: "PHONE"
    };
    customSearchKey = sysKeyMap[filter];

    // Case-insensitive search inside the answers table
    whereClause += ` AND t.id IN (
      SELECT tcfa.ticket_id 
      FROM ticket_custom_field_answers tcfa
      INNER JOIN custom_fields cf ON cf.id = tcfa.field_id
      WHERE cf.system_key = ? 
      AND LOWER(JSON_UNQUOTE(tcfa.answer)) LIKE LOWER(?)
    )`;
    params.push(customSearchKey, `%${search}%`);
  }
  else if (search && filter === "ticketId") {
    whereClause += " AND t.id = ?";
    params.push(search);
  }

  // 2. Dropdown Status Filter
  if (status && status !== 'all' && filter !== 'status') {
    whereClause += " AND t.status = ?";
    params.push(status);
  }

  // 3. Main Query
  const dataQuery = `
    SELECT
      t.id,
      t.status,
      t.created_at AS createdAt,
      COALESCE(ar.name, 'Not Assigned') AS assigned_resolver_name,
      d.name AS department_name,

      -- DYNAMIC VALUE LOGIC
      ${isCustomSearch ? `(
          SELECT JSON_UNQUOTE(ans.answer) 
          FROM ticket_custom_field_answers ans
          INNER JOIN custom_fields f ON f.id = ans.field_id
          WHERE ans.ticket_id = t.id AND f.system_key = ? 
          LIMIT 1
      )` : `u.name`} AS dynamicHeaderValue,

      CASE
        WHEN t.status IN ('RESOLVED', 'CLOSED') THEN 0
        WHEN NOW() > tts.due_at THEN 1
        ELSE 0
      END AS is_breached
    FROM tickets t
    LEFT JOIN users u ON t.created_by = u.id
    LEFT JOIN users ar ON t.assigned_to = ar.id
    LEFT JOIN departments d ON t.department_id = d.id
    LEFT JOIN ticket_tat_state tts ON t.id = tts.ticket_id
    ${whereClause}
    ORDER BY t.created_at DESC
    LIMIT ? OFFSET ?
  `;

  try {
    // Correctly order parameters for the data query
    const dataParams = isCustomSearch
      ? [customSearchKey, ...params, Number(limit), Number(offset)]
      : [...params, Number(limit), Number(offset)];

    const [countResult, dataResult] = await Promise.all([
      db.query(`SELECT COUNT(*) AS total FROM tickets t ${whereClause}`, params),
      db.query(dataQuery, dataParams)
    ]);

    return {
      data: dataResult[0],
      pagination: {
        total: countResult[0][0].total,
        page: Number(page),
        limit: Number(limit)
      }
    };
  } catch (err) {
    throw err;
  }
};

exports.getStatusesByOrderType = async (orderType) => {
  const [rows] = await db.execute(
    `SELECT 
        id,
        status_code,
        status_description
     FROM status_master
     WHERE order_type = ?
       AND status = 'ACTIVE'
     ORDER BY id`,
    [orderType]
  );

  return rows;
};

exports.getStageByStatus = async (statusCode) => {

  const [rows] = await db.execute(
    `SELECT st.id, st.stage_code, st.stage_label FROM status_stage_mapping ssm JOIN stage_master st ON st.id = ssm.stage_id WHERE ssm.status_id = 1 and st.stage_code='E0002' AND st.status = 'ACTIVE' limit 1;`
  );

  if (!rows.length) return null;

  return rows[0];
};

exports.getServiceOrderSOAP = async (payload) => {
  try {
    const response = await getHisenseServiceOrder(payload);

    return response;
  } catch (error) {
    throw error;
  }
};
//old


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

exports.updateTicketAgentRemark = async (
  ticketId,
  agentRemark,
  userId,
  isL1,
  IS_CONSULTING,
  finalPayload,
  userName,
  applicationType,
  files
) => {
  const connection = await db.getConnection();

  isL1 = isL1 === true || isL1 === "true";
  IS_CONSULTING = IS_CONSULTING === true || IS_CONSULTING === "true";
  let newConsultingTicketId = null;
  let consultingTicketNumber = null;
  let autoStatusId = null;
  let consultingTypeCode;

  const payload =
    typeof finalPayload === "string"
      ? JSON.parse(finalPayload)
      : finalPayload;

  try {

    await connection.beginTransaction();

    const [ticketRows] = await connection.execute(
      `SELECT 
        customer_id,
        customer_product_id,
        order_type_id,
        order_source_id,
        service_type_id,
        symptom_l1_id,
        symptom_l2_id,
        section_id,
        defect_id,
        repair_action_id,
        condition_flag,
        problem_note,
        current_status_id
      FROM tickets
      WHERE id = ?
      LIMIT 1`,
      [ticketId]
    );

    if (!ticketRows.length) {
      throw new Error("Ticket not found");
    }

    const ticket = ticketRows[0];

    await connection.execute(
      `UPDATE tickets
       SET agent_remarks = ?, updated_at = NOW()
       WHERE id = ?`,
      [agentRemark, ticketId]
    );

    await connection.execute(
      `INSERT INTO ticket_history
      (ticket_id, status_id, stage_id, remarks, changed_by)
      VALUES (?, ?, NULL, ?, ?)`,
      [
        ticketId,
        ticket.current_status_id,
        agentRemark,
        userId
      ]
    );

    const [orderTypeRows] = await connection.execute(
      `SELECT order_type
       FROM order_type_master
       WHERE id = ?
       LIMIT 1`,
      [ticket.order_type_id]
    );

    const orderTypeCode = orderTypeRows[0].order_type;

    if ((isL1 && orderTypeCode !== "ZWO4") || IS_CONSULTING) {
      const [consultingOrderTypeRows] = await connection.execute(
        `SELECT id FROM order_type_master WHERE order_type='ZWO4' LIMIT 1`
      );

      const consultingOrderTypeId = consultingOrderTypeRows[0].id;

      if (orderTypeCode === "ZSV1") consultingTypeCode = "W01";
      else if (orderTypeCode === "ZWO3") consultingTypeCode = "W01";

      const [consultingTypeRows] = await connection.execute(
        `SELECT id 
	FROM consulting_type_master
         WHERE consulting_type_code = ? AND consulting_type_name = ?
         LIMIT 1`,
        [consultingTypeCode,"General Inquiry"]
      );

      const consultingTypeId = consultingTypeRows[0].id;

      const [statusRows] = await connection.execute(
        `SELECT id FROM status_master
         WHERE status_code='E0003' and order_type='ZWO4'
         LIMIT 1`
      );

      autoStatusId = statusRows[0].id;

      // consultingTicketNumber = generateTicketNumber();

      const [newTicketResult] = await connection.execute(
        `INSERT INTO tickets(
          customer_id,
          customer_product_id,
          order_type_id,
          order_source_id,
          service_type_id,
          symptom_l1_id,
          symptom_l2_id,
          section_id,
          defect_id,
          repair_action_id,
          condition_flag,
          problem_note,
          agent_remarks,
          consulting_type_id,
          complaint_type_id,
          current_status_id,
          current_stage_id,
          created_by
        )
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,NULL,?,NULL,?)`,
        [
          ticket.customer_id,
          ticket.customer_product_id,
          consultingOrderTypeId,
          ticket.order_source_id,
          ticket.service_type_id,
          ticket.symptom_l1_id,
          ticket.symptom_l2_id,
          ticket.section_id,
          ticket.defect_id,
          ticket.repair_action_id,
          ticket.condition_flag,
          ticket.problem_note,
          agentRemark,
          consultingTypeId,
          autoStatusId,
          userId
        ]
      );

      newConsultingTicketId = newTicketResult.insertId;


      consultingTicketNumber = generateTicketNumber(
        newConsultingTicketId,
        "ZWO4"
      );

      await connection.execute(
        `UPDATE tickets SET ticket_number = ? WHERE id = ?`,
        [consultingTicketNumber, newConsultingTicketId]
      );

      await connection.execute(
        `INSERT INTO ticket_history
        (ticket_id,status_id,stage_id,remarks,changed_by)
        VALUES(?, ?, NULL, ?, ?)`,
        [
          newConsultingTicketId,
          autoStatusId,
          agentRemark,
          userId
        ]
      );

    }

    if (
      (applicationType === "EXCHANGE" || applicationType === "DOA") &&
      files &&
      files.length
    ) {

      await processAttachments({
        connection,
        ticketId,
        applicationType,
        files,
        userId
      });

    }

    await connection.commit();

    //To update on soap api

    process.nextTick(async () => {

      const sapConn = await db.getConnection();

      try {

        /* ---------------- OLD PAYLOAD ---------------- */

        const [[oldTicket]] = await sapConn.execute(
          `SELECT * FROM tickets WHERE id=? LIMIT 1`,
          [ticketId]
        );

        if (!oldTicket) return;

        const [logResult] = await sapConn.execute(
          `INSERT INTO sap_update_log
      (ticket_id,ticket_number,external_ticket_number,old_payload,status,source)
      VALUES(?,?,?,?, 'PENDING','UPDATE')`,
          [
            ticketId,
            oldTicket.ticket_number,
            oldTicket.external_ticket_number,
            JSON.stringify(oldTicket)
          ]
        );

        const logId = logResult.insertId;

        /* ---------------- FETCH SAP ORDER ---------------- */

        const soapFetch = await getHisenseServiceOrder({
          OBJECT_ID: oldTicket.external_ticket_number
        });

        if (!soapFetch || soapFetch?.data?.MSG_TYPE !== 'S') {

          await sapConn.execute(
            `UPDATE sap_update_log SET status='FAILED' WHERE id=?`,
            [logId]
          );

          return;
        }

        let order = soapFetch?.data?.HEAD;

        if (Array.isArray(order)) order = order[0];
        if (!order) return;

        /* ---------------- CURRENT DB STATE ---------------- */

        const [[currentTicket]] = await sapConn.execute(
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

        if (!currentTicket) return;

        /* ---------------- MASTER RESOLUTION ---------------- */

        const [[statusRow]] = await sapConn.execute(
          `SELECT id FROM status_master WHERE status_code=? LIMIT 1`,
          [order.ORDER_STATUS]
        );

        let stageId = null;

        if (order.IN_PROGRESS) {

          const [[stageRow]] = await sapConn.execute(
            `SELECT id FROM stage_master WHERE stage_code=? LIMIT 1`,
            [order.IN_PROGRESS]
          );

          stageId = stageRow?.id || null;

        }

        let customerModelId = null;

        if (order.CUSTOMER_MODEL) {

          const [[modelRow]] = await sapConn.execute(
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

          const [[productRow]] = await sapConn.execute(query, params);

          productId = productRow?.id || null;

        }

        const newAssignDate = sanitizeSapDate(order.ASSIGN_DATE);
        const newPurchaseDate = sanitizeSapDate(order.PURCHASE_DATE);

        /* ---------------- CHANGE DETECTION (same as syncServiceOrdersFromSAP) ---------------- */

        const statusChanged =
          currentTicket.current_status_id !== statusRow?.id;

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

        /* ---------------- UPDATE DB ONLY IF CHANGED ---------------- */

        if (statusChanged || stageChanged || remarkChanged || assignDateChanged) {

          await sapConn.execute(
            `UPDATE tickets
         SET current_status_id=?,
             current_stage_id=?,
             agent_remarks=?,
             assign_date=COALESCE(?,assign_date),
             updated_at=NOW()
         WHERE id=?`,
            [
              statusRow?.id,
              stageId,
              order.PROBLEM_NOTE || null,
              newAssignDate,
              ticketId
            ]
          );

          await sapConn.execute(
            `INSERT INTO ticket_history
         (ticket_id,status_id,stage_id,remarks,changed_by)
         VALUES(?,?,?,?,?)`,
            [
              ticketId,
              statusRow?.id,
              stageId,
              order.PROBLEM_NOTE || null,
              userId
            ]
          );

        }

        /* ---------------- UPDATE PRODUCT IF CHANGED ---------------- */

        if (productChanged || serialChanged || purchaseChanged) {

          await sapConn.execute(
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

        /* ---------------- SAP UPDATE RULE ---------------- */

        let allowSapUpdate = true;

        if (
          order.ORDER_TYPE === "ZSV1" &&
          (order.ORDER_STATUS === "E0006" || order.ORDER_STATUS === "E0014")
        ) {
          allowSapUpdate = false;
        }

        if (
          (order.ORDER_TYPE === "ZWO4" || order.ORDER_TYPE === "ZWO3") &&
          order.ORDER_STATUS === "E0003"
        ) {
          allowSapUpdate = false;
        }

        if (allowSapUpdate) {

          // const payload =
          //   typeof finalPayload === "string"
          //     ? JSON.parse(finalPayload)
          //     : finalPayload;
          /* ---------------- FETCH UPDATED TICKET ---------------- */
          const [[ticketPayload]] = await sapConn.execute(
            `SELECT
          t.external_ticket_number AS externalTicketNumber,
          ot.order_type AS ORDER_TYPE_CODE,
          sm.status_code AS STATUS_CODE,
          cp.warranty_type_id AS WARRANTYPEID,
          sg.stage_code AS STAGE_CODE,
          t.agent_remarks AS agent_remarks,
          t.problem_note AS problem_note,
          pid.product_code AS PRODUCT_ID_HISENSE,
          cm.model_number AS CUSTOMER_MODEL,
          cp.serial_no AS SERIALNO,
          cp.serial_no_alt AS ZZZSERIALNO1,
          cp.purchase_date AS PURCHASE_DATE,
          s1.symptom_1_code AS SYMPTOM_1_CODE,
          cat.code AS Category_Code,
          d.defect_code AS DEFECT_CODE,
          r.repair_code AS REPAIR_CODE,
          t.condition_flag AS CONDITION_CODE,
          sec.section_code AS SECTION_CODE,
          os.source_code AS ORDER_SOURCE_CODE
      FROM tickets t
      LEFT JOIN customer_products cp
             ON t.customer_product_id = cp.id
            AND cp.customer_id = t.customer_id
      LEFT JOIN product_ids pid ON cp.product_id = pid.id
      LEFT JOIN customer_models cm ON cm.id = pid.customer_model_id
      LEFT JOIN order_type_master ot ON ot.id = t.order_type_id
      LEFT JOIN symptom_level_1_master s1 ON s1.id = t.symptom_l1_id
      LEFT JOIN categories cat ON cat.id = s1.category_id
      LEFT JOIN section_master sec ON sec.id = t.section_id
      LEFT JOIN defect_master d ON d.id = t.defect_id
      LEFT JOIN repair_action_master r ON r.id = t.repair_action_id
      LEFT JOIN status_master sm ON sm.id = t.current_status_id
      LEFT JOIN stage_master sg ON sg.id = t.current_stage_id
        LEFT JOIN order_source_master os ON os.id = t.order_source_id
      WHERE t.id = ?
      LIMIT 1`,
            [ticketId]
          );

          if (!ticketPayload) return;

          /* ---------------- CALL SAP UPDATE ---------------- */

          const soapUpdatePayload = mapDbToSoapUpdate(ticketPayload);

          // const updatePayload = mapDbToSoapUpdate({ ...payload });

          await updateHisenseOrder({
            payload: soapUpdatePayload,
            ticketId: ticketId,
            ticketNumber: oldTicket.ticket_number,
            orderTypeCode: orderTypeCode
          });

        }

        /* ---------------- NEW PAYLOAD ---------------- */

        const [[newTicket]] = await sapConn.execute(
          `SELECT * FROM tickets WHERE id=? LIMIT 1`,
          [ticketId]
        );

        /* ---------------- UPDATE LOG ---------------- */

        await sapConn.execute(
          `UPDATE sap_update_log
       SET new_payload=?,
           sap_payload=?,
           status=?,
           updated_at=NOW()
       WHERE id=?`,
          [
            JSON.stringify(newTicket),
            JSON.stringify(order),
            allowSapUpdate ? 'UPDATED' : 'SKIPPED',
            logId
          ]
        );

      } catch (err) {

        console.error("SAP Update Error:", err.message);

      } finally {

        sapConn.release();

      }

    });

    // 🔥 NON BLOCKING SOAP CALL

    if (newConsultingTicketId) {

      process.nextTick(async () => {

        const soapConn = await db.getConnection();

        try {
          // 🔥 Resolve status code
          const statusCode = await resolveStatusCodeById(soapConn, autoStatusId);

          const soapPayload = mapDbToSoap({
            ...payload,
            SP_ORDER: consultingTicketNumber,
            ORDER_TYPE_CODE: 'ZWO4',
            STATUS_CODE: statusCode,
            SERVICE_TYPE: '',
            IN_PROGRESS: '',
            HEAD_FIELD1: consultingTypeCode,
            HEAD_FIELD3: "X",
            ORDER_SOURCE: 'ZWO4'
          });
          //To change on live 
          let soapResponse = await createHisenseOrder({
            payload: soapPayload,
            ticketId: newConsultingTicketId,
            ticketNumber: consultingTicketNumber,
            orderTypeCode: 'ZWO4'
          });

          // const soapResponse =
          //   await createHisenseOrder(soapPayload);

          if (soapResponse.success && soapResponse.objectId) {

            await soapConn.execute(
              `UPDATE tickets 
           SET external_ticket_number = ?
           WHERE id = ?`,
              [soapResponse.objectId, newConsultingTicketId]
            );
          }

        } catch (err) {
          console.error("Consulting SOAP Error:", err.message);
        } finally {
          soapConn.release();
        }

      });

    }

    return { success: true };

  } catch (error) {

    await connection.rollback();
    throw error;

  } finally {

    connection.release();

  }
};

exports.getTicketFullDetails = async (ticketId, field) => {

  const connection = await db.getConnection();
  try {

    const [rows] = await connection.execute(
      `
      SELECT

        -- Ticket Core
        t.id,
        t.application_type,
        t.ticket_number,
        t.external_ticket_number,
        t.order_type_id,
        t.order_source_id,
        t.service_type_id,
        t.symptom_l1_id,
        t.symptom_l2_id,
        t.section_id,
        t.defect_id,
        t.repair_action_id,
        t.condition_flag,
        t.problem_note,
        t.agent_remarks,
        t.assign_date,
        t.expected_closure_date,
        t.current_status_id,
        t.current_stage_id,
        t.consulting_type_id,
        t.complaint_type_id,
        t.created_at,

        -- Customer
        c.id AS customer_id,
        c.title,
        c.first_name,
        c.last_name,
        c.user_type,
        c.company_name,
        c.primary_phone,
        c.alternate_phone,
        c.email,
        c.country_code,
        c.zip_code,
        c.city,
        c.province,
        c.address_line1,
        c.address_line2,
        c.address_line3,
        c.building_code,

        -- Product
        cp.id AS customer_product_id,
        cp.product_id,
        cp.serial_no,
        cp.serial_no_alt,
        cp.purchase_date,
        cp.purchase_channel,
        cp.purchase_partner,
        cp.warranty_type_id,

        -- Hisense Product Code
        pi.product_code AS PRODUCT_ID_HISENSE,

        -- Masters
        ot.order_type AS order_type_code,
        ot.order_type_name,

        os.source_code,
        os.source_name,

        stype.service_type_code,
        stype.service_type_name,

        ct.complaint_type_code,
        ct.complaint_type_name,

        cst.consulting_type_code,
        cst.consulting_type_name,

        s1.symptom_1_code,
        s1.symptom_1_name,

        s2.symptom_2_code,
        s2.symptom_2_name,

        sec.section_code,
        sec.description AS section_name,

        d.defect_code,
        d.defect_description,

        r.repair_code,
        r.repair_description,

        sm.status_code,
        sm.status_description,

        sg.stage_code,
        sg.stage_label

      FROM tickets t
      JOIN customers c ON c.id = t.customer_id
      JOIN customer_products cp ON cp.id = t.customer_product_id
      LEFT JOIN product_ids pi ON pi.id = cp.product_id

      LEFT JOIN order_type_master ot ON ot.id = t.order_type_id
      LEFT JOIN order_source_master os ON os.id = t.order_source_id
      LEFT JOIN service_type_master stype ON stype.id = t.service_type_id
      LEFT JOIN complaint_type_master ct ON ct.id = t.complaint_type_id
      LEFT JOIN consulting_type_master cst ON cst.id = t.consulting_type_id
      LEFT JOIN symptom_level_1_master s1 ON s1.id = t.symptom_l1_id
      LEFT JOIN symptom_level_2_master s2 ON s2.id = t.symptom_l2_id
      LEFT JOIN section_master sec ON sec.id = t.section_id
      LEFT JOIN defect_master d ON d.id = t.defect_id
      LEFT JOIN repair_action_master r ON r.id = t.repair_action_id
      LEFT JOIN status_master sm ON sm.id = t.current_status_id
      LEFT JOIN stage_master sg ON sg.id = t.current_stage_id

      WHERE ${field} = ?
      LIMIT 1
      `,
      [ticketId]
    );

    if (!rows.length) {
      throw new Error('Ticket not found');
    }

    const row = rows[0];

    return {

      customer: {
        id: row.customer_id,
        title: row.title,
        firstName: row.first_name,
        lastName: row.last_name,
        userType: row.user_type,
        companyName: row.company_name,
        primaryPhone: row.primary_phone,
        alternatePhone: row.alternate_phone,
        email: row.email,
        countryCode: row.country_code,
        zipCode: row.zip_code,
        city: row.city,
        province: row.province,
        addressLine1: row.address_line1,
        addressLine2: row.address_line2,
        addressLine3: row.address_line3,
        buildingCode: row.building_code
      },

      product: {
        customerProductId: row.customer_product_id,
        productId: row.product_id,
        PRODUCT_ID_HISENSE: row.PRODUCT_ID_HISENSE,
        serialNo: row.serial_no,
        serialNoAlt: row.serial_no_alt,
        purchaseDate: row.purchase_date,
        purchaseChannel: row.purchase_channel,
        purchasePartner: row.purchase_partner,
        warrantyTypeId: row.warranty_type_id
      },

      ticket: {
        id: row.id,
        application_type: row.application_type,
        ticketNumber: row.ticket_number,
        externalTicketNumber: row.external_ticket_number,

        orderTypeId: row.order_type_id,
        orderTypeCode: row.order_type_code,
        orderType: row.order_type_name,

        orderSourceId: row.order_source_id,
        orderSourceCode: row.source_code,
        orderSource: row.source_name,

        serviceTypeId: row.service_type_id,
        serviceTypeCode: row.service_type_code,
        serviceType: row.service_type_name,

        complaintTypeId: row.complaint_type_id,
        complaintTypeCode: row.complaint_type_code,
        complaintType: row.complaint_type_name,

        consultingTypeId: row.consulting_type_id,
        consultingTypeCode: row.consulting_type_code,
        consultingType: row.consulting_type_name,

        symptom1Id: row.symptom_l1_id,
        symptom1Code: row.symptom_1_code,
        symptom1: row.symptom_1_name,

        symptom2Id: row.symptom_l2_id,
        symptom2Code: row.symptom_2_code,
        symptom2: row.symptom_2_name,

        sectionId: row.section_id,
        sectionCode: row.section_code,
        section: row.section_name,

        defectId: row.defect_id,
        defectCode: row.defect_code,
        defect: row.defect_description,

        repairActionId: row.repair_action_id,
        repairCode: row.repair_code,
        repair: row.repair_description,

        conditionFlag: row.condition_flag,
        problemNote: row.problem_note,
        agentRemarks: row.agent_remarks,

        assignDate: row.assign_date,
        expectedClosureDate: row.expected_closure_date,

        statusId: row.current_status_id,
        statusCode: row.status_code,
        status: row.status_description,

        stageId: row.current_stage_id,
        stageCode: row.stage_code,
        stage: row.stage_label,

        createdAt: row.created_at
      }
    };

  } finally {
    connection.release();
  }
};

exports.getRecentHistoryTickets = async ({
  primaryPhone,
  externalTicketNumber
}) => {

  if (!primaryPhone && !externalTicketNumber) {
    throw new Error('primaryPhone or externalTicketNumber is required');
  }

  const connection = await db.getConnection();

  try {

    let customerCondition = '';
    let value;

    if (primaryPhone) {
      customerCondition = `
        t.customer_id = (
          SELECT id FROM customers
          WHERE primary_phone = ?
          LIMIT 1
        )
      `;
      value = primaryPhone;
    } else {
      customerCondition = `
        t.customer_id = (
          SELECT customer_id FROM tickets
          WHERE external_ticket_number = ?
          LIMIT 1
        )
      `;
      value = externalTicketNumber;
    }

    const [rows] = await connection.execute(
      `
  SELECT
    t.id,  -- useful for UI click
    t.external_ticket_number,
    sm.status_description,
    st.stage_label,
    os.source_name AS order_source_name,  -- ✅ FIXED
    ot.order_type_name,
    t.created_at
  FROM tickets t
  JOIN status_master sm
    ON sm.id = t.current_status_id
  LEFT JOIN stage_master st
    ON st.id = t.current_stage_id
  JOIN order_source_master os
    ON os.id = t.order_source_id
  JOIN order_type_master ot
    ON ot.id = t.order_type_id
  WHERE ${customerCondition}
  
  ORDER BY t.created_at DESC
  LIMIT 5
  `,
      [value]
    );
    // AND sm.status_code IN ('E0001', 'E0013')
    return rows;

  } finally {
    connection.release();
  }
};

exports.getL2SlaTickets = async () => {

  const connection = await db.getConnection();

  try {

    const [rows] = await connection.execute(
      `
      SELECT

        ot.order_type_name AS orderType,

        t.id AS ticketId,

        t.external_ticket_number AS externalTicketNumber,

        sm.status_description AS ticketStatus,

        sg.stage_label AS ticketStage,

        os.source_name AS orderSource,

        DATE_FORMAT(t.created_at, '%d-%m-%Y %H:%i') AS createdAt,

        ROUND(
          (
            TIMESTAMPDIFF(SECOND, t.created_at, NOW())
            /
            TIMESTAMPDIFF(SECOND, t.created_at, t.assign_date)
          ) * 100
        ) AS slaPercent,

        u.role AS assignedGroup

      FROM tickets t

      JOIN order_type_master ot
        ON ot.id = t.order_type_id

      JOIN status_master sm
        ON sm.id = t.current_status_id

      LEFT JOIN stage_master sg
        ON sg.id = t.current_stage_id

      JOIN order_source_master os
        ON os.id = t.order_source_id

      LEFT JOIN users u
        ON u.id = t.assigned_to

      WHERE ot.order_type = 'ZSV1'
        AND t.assign_date IS NOT NULL

        -- Not Closed / Completed
        AND sm.status_code NOT IN (
          'E0005','E0006','E0014','E0015',
          'E0016','E0017','E0019','E0020'
        )

        -- >= 50% SLA
        AND TIMESTAMPDIFF(SECOND, t.created_at, NOW()) >=
            0.5 * TIMESTAMPDIFF(SECOND, t.created_at, t.assign_date)

      ORDER BY t.created_at DESC
      `
    );

    return rows.map(row => ({
      orderType: row.orderType,
      ticketId: row.ticketId,
      externalTicketNumber: row.externalTicketNumber,
      ticketStatus: row.ticketStatus,
      ticketStage: row.ticketStage,
      orderSource: row.orderSource,
      createdAt: row.createdAt,
      sla: `${row.slaPercent}%`,
      assignedGroup: row.assignedGroup || 'Unassigned'
    }));

  } finally {
    connection.release();
  }
};

exports.getL3SlaTickets = async () => {

  const connection = await db.getConnection();

  try {

    const [rows] = await connection.execute(
      `
      SELECT

        ot.order_type_name AS orderType,

        t.id AS ticketId,

        t.external_ticket_number AS externalTicketNumber,

        sm.status_description AS ticketStatus,

        sg.stage_label AS ticketStage,

        os.source_name AS orderSource,

        DATE_FORMAT(t.created_at, '%d-%m-%Y %H:%i') AS createdAt,

        ROUND(
          (
            TIMESTAMPDIFF(SECOND, t.created_at, NOW())
            /
            TIMESTAMPDIFF(SECOND, t.created_at, t.assign_date)
          ) * 100
        ) AS slaPercent,

        u.role AS assignedGroup

      FROM tickets t

      JOIN order_type_master ot
        ON ot.id = t.order_type_id

      JOIN status_master sm
        ON sm.id = t.current_status_id

      LEFT JOIN stage_master sg
        ON sg.id = t.current_stage_id

      JOIN order_source_master os
        ON os.id = t.order_source_id

      LEFT JOIN users u
        ON u.id = t.assigned_to

      WHERE ot.order_type = 'ZSV1'
        AND t.assign_date IS NOT NULL

        -- Not Closed / Completed
        AND sm.status_code NOT IN (
          'E0005','E0006','E0014','E0015',
          'E0016','E0017','E0019','E0020'
        )

        -- 100% breached
        AND NOW() >= t.assign_date

      ORDER BY t.created_at DESC
      `
    );

    return rows.map(row => ({
      orderType: row.orderType,
      ticketId: row.ticketId,
      externalTicketNumber: row.externalTicketNumber,
      ticketStatus: row.ticketStatus,
      ticketStage: row.ticketStage,
      orderSource: row.orderSource,
      createdAt: row.createdAt,
      sla: `${row.slaPercent}%`,
      assignedGroup: row.assignedGroup || 'Unassigned'
    }));

  } finally {
    connection.release();
  }
};

exports.getTicketHistory = async (ticketId) => {
  const connection = await db.getConnection();

  try {

    const [rows] = await connection.execute(
      `
      SELECT
        th.id,
        th.ticket_id,
        th.remarks,
        th.changed_by,
        u.name AS changed_by_name,
        th.changed_at
      FROM ticket_history th
      LEFT JOIN users u
        ON u.id = th.changed_by
      WHERE th.ticket_id = ?
      ORDER BY th.changed_at DESC
      `,
      [ticketId]
    );

    return rows;

  } finally {
    connection.release();
  }
};

exports.getTicketReportByDate = async ({ fromDate, toDate }) => {

  if (!fromDate || !toDate) {
    throw new Error('fromDate and toDate are required');
  }

  const connection = await db.getConnection();
  const startDate = `${fromDate} 00:00:00`;
  const endDate = `${toDate} 23:59:59`;
  try {

    const [rows] = await connection.execute(
      `
SELECT
 
    t.id AS ticket_id,
    t.external_ticket_number,
    t.created_at,
    u.email AS created_by_email,
 
    -- Customer
    c.first_name,
    c.last_name,
    c.primary_phone,
 
    -- Product Hierarchy
    cat.name AS category_name,
    sc.name AS sub_category_name,
    ms.spec_value,
    cm.model_number,
    pi.product_code,
 
    -- Product Instance
    cp.product_id,
    cp.serial_no,
    cp.serial_no_alt,
    cp.purchase_date,
    cp.purchase_channel,
    cp.purchase_partner,
    cp.warranty_type_id,
 
    -- Agent Input
    ot.order_type_name,
    os.source_name,
    stype.service_type_name,
    ct.complaint_type_name,
    cst.consulting_type_name,
    s1.symptom_1_name,
    s2.symptom_2_name,
    sec.description AS section_name,
    d.defect_description,
    r.repair_description,
    t.condition_flag,
    sm.status_description,
    sg.stage_label,
    t.assign_date,
    t.expected_closure_date,
 
    -- Notes
    t.problem_note,
    t.agent_remarks
 
FROM tickets t
 
JOIN customers c 
    ON c.id = t.customer_id
 
JOIN customer_products cp 
    ON cp.id = t.customer_product_id

-- Created By
LEFT JOIN users u
    ON u.id = t.created_by
 
-- Product chain
LEFT JOIN product_ids pi 
    ON pi.id = cp.product_id
 
LEFT JOIN customer_models cm 
    ON cm.id = pi.customer_model_id
 
LEFT JOIN model_specifications ms 
    ON ms.id = cm.model_spec_id
 
LEFT JOIN sub_categories sc 
    ON sc.id = ms.sub_category_id
 
LEFT JOIN categories cat 
    ON cat.id = sc.category_id
 
-- Other masters
LEFT JOIN order_type_master ot 
    ON ot.id = t.order_type_id
 
LEFT JOIN order_source_master os 
    ON os.id = t.order_source_id
 
LEFT JOIN service_type_master stype 
    ON stype.id = t.service_type_id
 
LEFT JOIN complaint_type_master ct 
    ON ct.id = t.complaint_type_id
 
LEFT JOIN consulting_type_master cst 
    ON cst.id = t.consulting_type_id
 
LEFT JOIN symptom_level_1_master s1 
    ON s1.id = t.symptom_l1_id
 
LEFT JOIN symptom_level_2_master s2 
    ON s2.id = t.symptom_l2_id
 
LEFT JOIN section_master sec 
    ON sec.id = t.section_id
 
LEFT JOIN defect_master d 
    ON d.id = t.defect_id
 
LEFT JOIN repair_action_master r 
    ON r.id = t.repair_action_id
 
LEFT JOIN status_master sm 
    ON sm.id = t.current_status_id
 
LEFT JOIN stage_master sg 
    ON sg.id = t.current_stage_id
       WHERE t.created_at >= ? 
  AND t.created_at < ?
ORDER BY t.created_at DESC
      `,
      [startDate, endDate]
    );

    return rows;

  } finally {
    connection.release();
  }
};

exports.uploadAttachments = async ({
  ticketId,
  applicationType,
  files,
  userId
}) => {

  const connection = await db.getConnection();

  try {

    // 1️⃣ Validate application type
    if (!ATTACHMENT_CONFIG[applicationType]) {
      throw new Error('Invalid application type');
    }

    const config = ATTACHMENT_CONFIG[applicationType];

    // 2️⃣ Update ticket with application_type
    await connection.execute(
      `UPDATE tickets SET application_type = ? WHERE id = ?`,
      [applicationType, ticketId]
    );

    // 3️⃣ Convert files to map
    const fileMap = {};
    files.forEach(file => {
      fileMap[file.fieldname] = file;
    });

    // 4️⃣ Validate required files
    for (const requiredField of config.required) {
      if (!fileMap[requiredField]) {
        throw new Error(`${requiredField} is mandatory`);
      }
    }

    // 5️⃣ Validate and insert
    for (const fieldName in fileMap) {

      const file = fileMap[fieldName];
      const rule = ATTACHMENT_RULES[fieldName];

      if (!rule) {
        throw new Error(`Invalid attachment slot: ${fieldName}`);
      }

      if (file.size > rule.maxSize) {
        throw new Error(`${fieldName} exceeds size limit`);
      }

      if (rule.type === 'IMAGE') {
        if (
          !file.mimetype.startsWith('image/') &&
          file.mimetype !== 'application/pdf'
        ) {
          throw new Error(`${fieldName} invalid format`);
        }
      }

      if (rule.type === 'VIDEO') {
        if (!file.mimetype.startsWith('video/')) {
          throw new Error(`${fieldName} must be video`);
        }
      }

      // Only insert (no delete / overwrite)
      await connection.execute(
        `
        INSERT INTO ticket_attachments
        (ticket_id, attachment_type, file_name, file_path, file_size, mime_type, uploaded_by)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
          ticketId,
          fieldName,
          file.originalname,
          file.path,
          file.size,
          file.mimetype,
          userId
        ]
      );
    }

    return { message: 'Attachments uploaded successfully' };

  } finally {
    connection.release();
  }
};


// async function processAttachments({
//   connection,
//   ticketId,
//   applicationType,
//   files,
//   userId
// }) 
// {

//   if (!applicationType) return;

//   const config = ATTACHMENT_CONFIG[applicationType];

//   if (!config) {
//     throw new Error('Invalid application type');
//   }

//   if (!files || files.length === 0) {
//     throw new Error('Attachments required');
//   }

//   const allowedSlots = [
//     ...config.required,
//     ...config.optional
//   ];

//   const fileMap = {};

//   files.forEach(file => {
//     fileMap[file.fieldname] = file;
//   });

//   // Validate required attachments
//   for (const requiredField of config.required) {
//     if (!fileMap[requiredField]) {
//       throw new Error(`${requiredField} is mandatory`);
//     }
//   }

//   // Update application type on ticket
//   await connection.execute(
//     `UPDATE tickets SET application_type = ? WHERE id = ?`,
//     [applicationType, ticketId]
//   );

//   // Validate each uploaded file
//   for (const fieldName in fileMap) {

//     const file = fileMap[fieldName];

//     if (!allowedSlots.includes(fieldName)) {
//       throw new Error(`Invalid attachment slot: ${fieldName}`);
//     }

//     const rule = ATTACHMENT_RULES[fieldName];

//     if (!rule) {
//       throw new Error(`No validation rule defined for ${fieldName}`);
//     }

//     // Size validation
//     if (file.size > rule.maxSize) {
//       throw new Error(`${fieldName} exceeds allowed size`);
//     }

//     // Type validation
//     switch (rule.type) {

//       case 'IMAGE':
//         if (
//           !file.mimetype.startsWith('image/') &&
//           file.mimetype !== 'application/pdf'
//         ) {
//           throw new Error(`${fieldName} must be an image or PDF`);
//         }
//         break;

//       case 'VIDEO':
//         if (!file.mimetype.startsWith('video/')) {
//           throw new Error(`${fieldName} must be a video file`);
//         }
//         break;

//       case 'ANY':
//         // no format restriction
//         break;

//       default:
//         throw new Error(`Unknown rule type for ${fieldName}`);
//     }

//     // Prevent duplicate slot uploads
//     const [existing] = await connection.execute(
//       `
//       SELECT id
//       FROM ticket_attachments
//       WHERE ticket_id = ?
//       AND attachment_type = ?
//       LIMIT 1
//       `,
//       [ticketId, fieldName]
//     );

//     if (existing.length) {
//       throw new Error(`${fieldName} already uploaded for this ticket`);
//     }

//     await connection.execute(
//       `
//       INSERT INTO ticket_attachments
//       (
//         ticket_id,
//         attachment_type,
//         file_name,
//         file_path,
//         file_size,
//         mime_type,
//         uploaded_by
//       )
//       VALUES (?, ?, ?, ?, ?, ?, ?)
//       `,
//       [
//         ticketId,
//         fieldName,
//         file.originalname,
//         file.path,
//         file.size,
//         file.mimetype,
//         userId
//       ]
//     );
//   }

// }

async function processAttachments({
  connection,
  ticketId,
  applicationType,
  files,
  userId
}) {

  const config = ATTACHMENT_CONFIG[applicationType];

  if (!config) throw new Error("Invalid application type");

  const allowedSlots = [
    ...config.required,
    ...config.optional
  ];

  const fileMap = {};

  files.forEach(file => {
    fileMap[file.fieldname] = file;
  });

  for (const requiredField of config.required) {
    if (!fileMap[requiredField]) {
      throw new Error(`${requiredField} is mandatory`);
    }
  }

  await connection.execute(
    `UPDATE tickets SET application_type=? WHERE id=?`,
    [applicationType, ticketId]
  );

  for (const fieldName in fileMap) {

    const file = fileMap[fieldName];

    if (!allowedSlots.includes(fieldName)) {
      throw new Error(`Invalid attachment slot: ${fieldName}`);
    }

    const rule = ATTACHMENT_RULES[fieldName];

    if (!rule) {
      throw new Error(`No rule defined for ${fieldName}`);
    }

    if (file.size > rule.maxSize) {
      throw new Error(`${fieldName} exceeds allowed size`);
    }

    if (rule.type === "IMAGE") {

      if (
        !file.mimetype.startsWith("image/") &&
        file.mimetype !== "application/pdf"
      ) {
        throw new Error(`${fieldName} must be image or PDF`);
      }

    }

    if (rule.type === "VIDEO") {

      if (!file.mimetype.startsWith("video/")) {
        throw new Error(`${fieldName} must be video`);
      }

    }

    const [existing] = await connection.execute(
      `SELECT id FROM ticket_attachments
       WHERE ticket_id=? AND attachment_type=? LIMIT 1`,
      [ticketId, fieldName]
    );

    if (existing.length) {
      throw new Error(`${fieldName} already uploaded`);
    }

    await connection.execute(
      `INSERT INTO ticket_attachments
      (ticket_id,attachment_type,file_name,file_path,file_size,mime_type,uploaded_by)
      VALUES(?,?,?,?,?,?,?)`,
      [
        ticketId,
        fieldName,
        file.originalname,
        file.path,
        file.size,
        file.mimetype,
        userId
      ]
    );

  }

}

exports.getInternalValidationTickets = async () => {

  const connection = await db.getConnection();

  try {

    const [rows] = await connection.execute(`
      SELECT
        t.id AS ticket_id,
        t.external_ticket_number AS hcrm_id,
        t.application_type AS type,
        ot.order_type_name AS ticket_type,
        sm.status_description AS status,
        st.stage_label AS stage,
        os.source_name AS created_by,
        t.created_at

      FROM tickets t

      JOIN order_type_master ot
        ON ot.id = t.order_type_id

      LEFT JOIN status_master sm
        ON sm.id = t.current_status_id

      LEFT JOIN stage_master st
        ON st.id = t.current_stage_id

      LEFT JOIN order_source_master os
        ON os.id = t.order_source_id

      WHERE t.application_type IN ('EXCHANGE','DOA')

      AND EXISTS (
        SELECT 1
        FROM ticket_attachments ta
        WHERE ta.ticket_id = t.id
        AND ta.validation_status = 'PENDING'
      )

      AND (
        (ot.order_type = 'ZSV1' AND sm.status_code IN ('E0002','E0003'))
        OR
        (ot.order_type = 'ZWO3' AND sm.status_code IN ('E0001','E0002'))
      )

      ORDER BY t.created_at DESC
    `);

    return rows;

  } finally {
    connection.release();
  }

};

exports.getTicketAttachments = async (ticketId) => {

  const connection = await db.getConnection();

  try {

    const baseUrl = process.env.FILE_BASE_URL || "https://hisense.cogentlab.com/hisense-ts-api";
    const [rows] = await connection.execute(
      `
      SELECT
        ta.id AS attachment_id,
        ta.attachment_type,
        ta.file_name,
        ta.file_path,
        ta.file_size,
        ta.mime_type,
        ta.validation_status,
        ta.validation_remark,
        u.name AS uploaded_by,
        ta.created_at

      FROM ticket_attachments ta

      LEFT JOIN users u
        ON u.id = ta.uploaded_by

      WHERE ta.ticket_id = ?

      ORDER BY ta.created_at ASC
      `,
      [ticketId]
    );

    // return rows;
    return rows.map(row => ({
      attachment_id: row.attachment_id,
      attachment_type: row.attachment_type,
      file_name: row.file_name,
      file_path: `${baseUrl}/${row.file_path}`,
      file_size: row.file_size,
      mime_type: row.mime_type,
      validation_status: row.validation_status,
      validation_remark: row.validation_remark,
      uploaded_by: row.uploaded_by,
      created_at: row.created_at
    }));

  } finally {

    connection.release();

  }

};

exports.validateTicketAttachments = async (
  ticketId,
  attachments,
  userId
) => {

  const connection = await db.getConnection();

  try {

    await connection.beginTransaction();

    for (const item of attachments) {

      const { attachmentId, status, remark } = item;

      if (!attachmentId) {
        throw new Error("attachmentId is required");
      }

      if (!["APPROVED", "DECLINED"].includes(status)) {
        throw new Error(`Invalid status for attachment ${attachmentId}`);
      }

      if (status === "DECLINED" && !remark) {
        throw new Error(
          `Remark is mandatory when declining attachment ${attachmentId}`
        );
      }

      const [existing] = await connection.execute(
        `
        SELECT id
        FROM ticket_attachments
        WHERE id = ?
        AND ticket_id = ?
        LIMIT 1
        `,
        [attachmentId, ticketId]
      );

      if (!existing.length) {
        throw new Error(`Attachment ${attachmentId} not found for ticket`);
      }

      await connection.execute(
        `
        UPDATE ticket_attachments
        SET
          validation_status = ?,
          validation_remark = ?,
          validated_by = ?,
          validated_at = NOW()
        WHERE id = ?
        `,
        [
          status,
          remark || null,
          userId,
          attachmentId
        ]
      );

    }

    await connection.commit();

    return {
      success: true,
      message: "Attachments validated successfully"
    };

  } catch (error) {

    await connection.rollback();
    throw error;

  } finally {

    connection.release();

  }

};

exports.getApplicationValidationDetails = async (ticketId, field, applicationType) => {

  const connection = await db.getConnection();

  try {

    const [rows] = await connection.execute(
      `
      SELECT

        -- Ticket Core
        t.id,
        t.application_type,
        t.ticket_number,
        t.external_ticket_number,
        t.order_type_id,
        t.order_source_id,
        t.service_type_id,
        t.symptom_l1_id,
        t.symptom_l2_id,
        t.section_id,
        t.defect_id,
        t.repair_action_id,
        t.condition_flag,
        t.problem_note,
        t.agent_remarks,
        t.assign_date,
        t.expected_closure_date,
        t.current_status_id,
        t.current_stage_id,
        t.consulting_type_id,
        t.complaint_type_id,
        t.created_at,

        -- Customer
        c.id AS customer_id,
        c.title,
        c.first_name,
        c.last_name,
        c.user_type,
        c.company_name,
        c.primary_phone,
        c.alternate_phone,
        c.email,
        c.country_code,
        c.zip_code,
        c.city,
        c.province,
        c.address_line1,
        c.address_line2,
        c.address_line3,
        c.building_code,

        -- Product
        cp.id AS customer_product_id,
        cp.product_id,
        cp.serial_no,
        cp.serial_no_alt,
        cp.purchase_date,
        cp.purchase_channel,
        cp.purchase_partner,
        cp.warranty_type_id,

        -- Hisense Product Code
        pi.product_code AS PRODUCT_ID_HISENSE,

        -- Masters
        ot.order_type AS order_type_code,
        ot.order_type_name,

        os.source_code,
        os.source_name,

        stype.service_type_code,
        stype.service_type_name,

        ct.complaint_type_code,
        ct.complaint_type_name,

        cst.consulting_type_code,
        cst.consulting_type_name,

        s1.symptom_1_code,
        s1.symptom_1_name,

        s2.symptom_2_code,
        s2.symptom_2_name,

        sec.section_code,
        sec.description AS section_name,

        d.defect_code,
        d.defect_description,

        r.repair_code,
        r.repair_description,

        sm.status_code,
        sm.status_description,

        sg.stage_code,
        sg.stage_label

      FROM tickets t
      JOIN customers c ON c.id = t.customer_id
      JOIN customer_products cp ON cp.id = t.customer_product_id
      LEFT JOIN product_ids pi ON pi.id = cp.product_id

      LEFT JOIN order_type_master ot ON ot.id = t.order_type_id
      LEFT JOIN order_source_master os ON os.id = t.order_source_id
      LEFT JOIN service_type_master stype ON stype.id = t.service_type_id
      LEFT JOIN complaint_type_master ct ON ct.id = t.complaint_type_id
      LEFT JOIN consulting_type_master cst ON cst.id = t.consulting_type_id
      LEFT JOIN symptom_level_1_master s1 ON s1.id = t.symptom_l1_id
      LEFT JOIN symptom_level_2_master s2 ON s2.id = t.symptom_l2_id
      LEFT JOIN section_master sec ON sec.id = t.section_id
      LEFT JOIN defect_master d ON d.id = t.defect_id
      LEFT JOIN repair_action_master r ON r.id = t.repair_action_id
      LEFT JOIN status_master sm ON sm.id = t.current_status_id
      LEFT JOIN stage_master sg ON sg.id = t.current_stage_id

      WHERE ${field} = ?
      LIMIT 1
      `,
      [ticketId]
    );

    if (!rows.length) {
      throw new Error("Ticket not found");
    }

    const row = rows[0];

    /**
     * VALIDATION RULES
     */

    if (row.order_type_code !== "ZSV1") {
      throw new Error("Application allowed only for Service Request tickets");
    }

    if (["E0006", "E0014"].includes(row.status_code)) {
      throw new Error(`Application not allowed because ticket status is ${row.status_description}`);
    }

    if (applicationType === "DOA") {

      if (row.user_type === "CUSTOMER") {

        const createdDate = new Date(row.created_at);
        const purchaseDate = new Date(row.purchase_date);

        const diffDays = Math.floor(
          (createdDate - purchaseDate) / (1000 * 60 * 60 * 24)
        );

        if (diffDays > 10) {
          throw new Error(
            `DOA allowed only within 10 days of purchase. Current difference: ${diffDays} days`
          );
        }
      }
    }

    /**
     * RETURN SAME STRUCTURE AS getTicketFullDetails
     */

    return {

      customer: {
        id: row.customer_id,
        title: row.title,
        firstName: row.first_name,
        lastName: row.last_name,
        userType: row.user_type,
        companyName: row.company_name,
        primaryPhone: row.primary_phone,
        alternatePhone: row.alternate_phone,
        email: row.email,
        countryCode: row.country_code,
        zipCode: row.zip_code,
        city: row.city,
        province: row.province,
        addressLine1: row.address_line1,
        addressLine2: row.address_line2,
        addressLine3: row.address_line3,
        buildingCode: row.building_code
      },

      product: {
        customerProductId: row.customer_product_id,
        productId: row.product_id,
        PRODUCT_ID_HISENSE: row.PRODUCT_ID_HISENSE,
        serialNo: row.serial_no,
        serialNoAlt: row.serial_no_alt,
        purchaseDate: row.purchase_date,
        purchaseChannel: row.purchase_channel,
        purchasePartner: row.purchase_partner,
        warrantyTypeId: row.warranty_type_id
      },

      ticket: {
        id: row.id,
        application_type: row.application_type,
        ticketNumber: row.ticket_number,
        externalTicketNumber: row.external_ticket_number,

        orderTypeId: row.order_type_id,
        orderTypeCode: row.order_type_code,
        orderType: row.order_type_name,

        orderSourceId: row.order_source_id,
        orderSourceCode: row.source_code,
        orderSource: row.source_name,

        serviceTypeId: row.service_type_id,
        serviceTypeCode: row.service_type_code,
        serviceType: row.service_type_name,

        complaintTypeId: row.complaint_type_id,
        complaintTypeCode: row.complaint_type_code,
        complaintType: row.complaint_type_name,

        consultingTypeId: row.consulting_type_id,
        consultingTypeCode: row.consulting_type_code,
        consultingType: row.consulting_type_name,

        symptom1Id: row.symptom_l1_id,
        symptom1Code: row.symptom_1_code,
        symptom1: row.symptom_1_name,

        symptom2Id: row.symptom_l2_id,
        symptom2Code: row.symptom_2_code,
        symptom2: row.symptom_2_name,

        sectionId: row.section_id,
        sectionCode: row.section_code,
        section: row.section_name,

        defectId: row.defect_id,
        defectCode: row.defect_code,
        defect: row.defect_description,

        repairActionId: row.repair_action_id,
        repairCode: row.repair_code,
        repair: row.repair_description,

        conditionFlag: row.condition_flag,
        problemNote: row.problem_note,
        agentRemarks: row.agent_remarks,

        assignDate: row.assign_date,
        expectedClosureDate: row.expected_closure_date,

        statusId: row.current_status_id,
        statusCode: row.status_code,
        status: row.status_description,

        stageId: row.current_stage_id,
        stageCode: row.stage_code,
        stage: row.stage_label,

        createdAt: row.created_at
      }

    };

  } finally {

    connection.release();

  }

};

exports.retryFailedSapCreates_dummy = async () => {

  const connection = await db.getConnection();

  try {
    // 1049 because started inserting xml payload after this
    const [logs] = await connection.execute(
      `SELECT t.id,ticket_number,ot.order_type,r.repair_code,sec.section_code,d.defect_code,city,
CONCAT('<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:haixin:all2crm">
<soapenv:Header/><soapenv:Body><urn:MT_ORDERCREATE_REQUEST><HEAD><LINE_ID>1</LINE_ID><OBJECT_ID></OBJECT_ID>',
'<SP_ORDER>', ticket_number,'</SP_ORDER>','<PROBLEM_DES>', ifnull(problem_note,'NA'), '</PROBLEM_DES>',
'<ORDER_SOURCE>ZWO4</ORDER_SOURCE><SALES_ORG>O 50000615</SALES_ORG><DIS_CHANNEL>11</DIS_CHANNEL><DIVISION>00</DIVISION>',
'<ORDER_TYPE>',ot.order_type,'</ORDER_TYPE>', '<ORDER_STATUS>E0003</ORDER_STATUS><CREATE_USER></CREATE_USER>',
'<CREATE_DATE>',DATE_FORMAT(t.created_at,'%Y%m%d'),'</CREATE_DATE>',
'<ASSIGN_DATE>',DATE_FORMAT(ifnull(assign_date,t.created_at),'%Y%m%d'),'</ASSIGN_DATE>', '<ACK_DATE></ACK_DATE><IN_DEPOT_DATE></IN_DEPOT_DATE><REPAIR_DATE></REPAIR_DATE><WARRANTYPE>I</WARRANTYPE><SERVICE_TYPE></SERVICE_TYPE><IN_PROGRESS>IN022</IN_PROGRESS>',
'<PROBLEM_NOTE>',ifnull(agent_remarks,'NA'),'</PROBLEM_NOTE>',
'<REPAIR_NOTE></REPAIR_NOTE><CAN_REASN></CAN_REASN>',
'<PRODUCT_ID>',ifnull(product_code,'NA'),'</PRODUCT_ID>',
'<FACTORY_MODEL></FACTORY_MODEL>',
'<CUSTOMER_MODEL>',ifnull(model_number,'NA'),'</CUSTOMER_MODEL>',
'<SERIALNO>NA</SERIALNO><ZZZSERIALNO1></ZZZSERIALNO1><ZZZSERIALNO2></ZZZSERIALNO2><IMEI1_OLD></IMEI1_OLD><IMEI2_OLD></IMEI2_OLD><EXT_REF></EXT_REF><PURCHASE_DATE>20260106</PURCHASE_DATE>',
'<SYMPTOMS_CODE>',ifnull(symptom_2_code,'NA'),'</SYMPTOMS_CODE>', '<SYMPTOMS_CODE_G>',cat.code,'</SYMPTOMS_CODE_G>',
'<SYMPTOMS_CODE_TXT></SYMPTOMS_CODE_TXT>', '<DEFECT_CODE>',d.defect_code,'</DEFECT_CODE>',
'<DEFECT_CODE_G>',cat.code,'</DEFECT_CODE_G>', '<DEFECT_CODE_TXT></DEFECT_CODE_TXT>',
'<REPAIR_CODE>',r.repair_code,'</REPAIR_CODE>', '<REPAIR_CODE_G>',cat.code,'</REPAIR_CODE_G>',
'<REPAIR_CODE_TXT></REPAIR_CODE_TXT><CONDITION_CODE>0</CONDITION_CODE>',
'<SECTION_CODE>',sec.section_code,'</SECTION_CODE>', '<MBL_CLT_TYPE></MBL_CLT_TYPE><PACAKGING></PACAKGING><PURCHASE_INVOICE_NO></PURCHASE_INVOICE_NO><SP_PARTNER>204272</SP_PARTNER><END_USER_TYPE>DEALER</END_USER_TYPE><TITLE></TITLE><END_USER_ID></END_USER_ID>',
'<END_FIRST_NAME>',first_name,'</END_FIRST_NAME>', '<END_LAST_NAME>',last_name,'</END_LAST_NAME>',
'<END_COMP_NAME></END_COMP_NAME>', '<END_TELEPHONE>',primary_phone,'</END_TELEPHONE>',
'<END_CELL_PHONE></END_CELL_PHONE>', '<END_COUNTRY>IN</END_COUNTRY>', '<END_CITY>',c.city,'</END_CITY>',
'<END_PROVINCE>',province,'</END_PROVINCE>', '<END_ZIP_CODE>',zip_code,'</END_ZIP_CODE>',
'<END_ADDRESS1>',address_line1,'</END_ADDRESS1>', '<END_ADDRESS2>',address_line2,'</END_ADDRESS2>',
'<END_ADDRESS3>',address_line3,'</END_ADDRESS3>', '<END_USER_BUILDING_CODE></END_USER_BUILDING_CODE>',
'<END_EMAIL>',email,'</END_EMAIL>', '<STORE_ID></STORE_ID><STORE_NAME1></STORE_NAME1><STORE_NAME2></STORE_NAME2><STORE_PHONE></STORE_PHONE><STORE_COUNTRY></STORE_COUNTRY><STORE_CITY></STORE_CITY><STORE_PROVINCE></STORE_PROVINCE><STORE_ZIP_CODE></STORE_ZIP_CODE><STORE_ADDRESS1></STORE_ADDRESS1><STORE_ADDRESS2></STORE_ADDRESS2><STORE_ADDRESS3></STORE_ADDRESS3><STORE_BUILDING_CODE></STORE_BUILDING_CODE><STORE_EMAIL></STORE_EMAIL><STORE_REFERENCE_NO></STORE_REFERENCE_NO><STORE_CONTACT_PERSON></STORE_CONTACT_PERSON><STORE_CONTACT_PHONE></STORE_CONTACT_PHONE><STORE_CONTACT_CELLPHONE></STORE_CONTACT_CELLPHONE><STORE_CONTACT_EMAIL></STORE_CONTACT_EMAIL><COLLECT_POINT></COLLECT_POINT><TRACKING_NO_FR_COM></TRACKING_NO_FR_COM><TRACKING_NO_FR></TRACKING_NO_FR><TRACKING_NO_TO_COM></TRACKING_NO_TO_COM><TRACKING_NO_TO></TRACKING_NO_TO><OPERATOR_CODE></OPERATOR_CODE><FIRMWARE></FIRMWARE><HEAD_FIELD1>',cst.consulting_type_code,'</HEAD_FIELD1><HEAD_FIELD2></HEAD_FIELD2><HEAD_FIELD3></HEAD_FIELD3><HEAD_FIELD4></HEAD_FIELD4><HEAD_FIELD5></HEAD_FIELD5><ITEM><ITEM_NUMBER></ITEM_NUMBER><ITEM_PRODUCT_ID></ITEM_PRODUCT_ID><ITEM_PRODUCT_DES></ITEM_PRODUCT_DES><ITEM_QUANTITY></ITEM_QUANTITY><ITEM_SERIAL_NO></ITEM_SERIAL_NO><ITEM_CATEGORY></ITEM_CATEGORY><ITEM_STATUS></ITEM_STATUS><ITEM_NET_VALUE></ITEM_NET_VALUE><ITEM_FIELD1></ITEM_FIELD1><ITEM_FIELD2></ITEM_FIELD2><ITEM_FIELD3></ITEM_FIELD3><ITEM_FIELD4></ITEM_FIELD4><ITEM_FIELD5></ITEM_FIELD5></ITEM></HEAD></urn:MT_ORDERCREATE_REQUEST></soapenv:Body></soapenv:Envelope>' ) AS xml_payload
FROM 
(SELECT * FROM tickets WHERE external_ticket_number is null and order_type_id=2 and(customer_product_id is not null and  order_type_id  is not null and  symptom_l1_id  is not null and  symptom_l2_id  is not null and  section_id  is not null and defect_id  is not null and repair_action_id is not null)
)t
LEFT JOIN customers c ON c.id = t.customer_id
LEFT JOIN customer_products cp ON cp.id = t.customer_product_id
left join product_ids pi on t.customer_product_id=pi.id
left join customer_models cm on pi.customer_model_id=cm.id
      LEFT JOIN order_type_master ot ON ot.id = t.order_type_id 
      LEFT JOIN order_source_master os ON os.id = t.order_source_id
      LEFT JOIN service_type_master stype ON stype.id = t.service_type_id
      LEFT JOIN complaint_type_master ct ON ct.id = t.complaint_type_id
      LEFT JOIN consulting_type_master cst ON cst.id = t.consulting_type_id
      LEFT JOIN symptom_level_1_master s1 ON s1.id = t.symptom_l1_id
      LEFT JOIN categories cat ON s1.category_id = cat.id
      LEFT JOIN symptom_level_2_master s2 ON s2.id = t.symptom_l2_id
      LEFT JOIN section_master sec ON sec.id = t.section_id
      LEFT JOIN defect_master d ON d.id = t.defect_id
      LEFT JOIN repair_action_master r ON r.id = t.repair_action_id
      LEFT JOIN status_master sm ON sm.id = t.current_status_id
      LEFT JOIN stage_master sg ON sg.id = t.current_stage_id limit 1;`,
    );

    if (!logs.length) {
      console.log("SAP Retry: No failed records");
      return;
    }

    for (const log of logs) {

      let soapStatus = "FAILED";
      let externalTicketNumber = null;
      let soapError = null;
      let rawResponse = null;

      try {

        const response = await axios.post(
          HISENSE_SOAP_URL,
          log.xml_payload,
          {
            headers: {
              "Content-Type": "text/xml;charset=UTF-8",
              "SOAPAction": "\"http://sap.com/xi/WebService/soap1.1\"",
            },
            auth: {
              username: HISENSE_USERNAME,
              password: HISENSE_PASSWORD
            },
            timeout: 30000,
            validateStatus: () => true
          }
        );

        rawResponse = response.data;

        const parsed = await parseStringPromise(response.data, {
          explicitArray: false,
          tagNameProcessors: [processors.stripPrefix],
        });

        const msgTab =
          parsed?.Envelope?.Body?.MT_ORDERCREATE_RESPONSE?.MSGTAB;

        if (msgTab?.MSGTYPE === "S") {

          soapStatus = "SUCCESS";
          externalTicketNumber = msgTab.OBJECT_ID;

          // update ticket
          await connection.execute(
            `UPDATE tickets
                         SET external_ticket_number = ?
                         WHERE id = ?`,
            [externalTicketNumber, log.id]
          );

        } else {
          soapError = msgTab?.MSGINFO || "SAP returned failure";
        }

      } catch (err) {
        soapError = err.message;
      }

      // update sap_sync_log
      // await connection.execute(
      //     `UPDATE sap_sync_log
      //      SET response_payload = ?,
      //      external_ticket_number = ?,
      //      status = ?,
      //      error_message = ?
      //      WHERE id = ?`,
      //     [
      //         rawResponse,
      //         externalTicketNumber,
      //         soapStatus,
      //         soapError,
      //         log.id
      //     ]
      // );

      await connection.query(
        `INSERT INTO sap_sync_log (
      ticket_id,
      ticket_number,
      order_type_code,
      request_payload,
      response_payload,
      external_ticket_number,
      status,
      error_message,
      request_type
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          log.id,
          log.ticket_number,
          log.order_type,
          log.xml_payload,
          rawResponse,
          externalTicketNumber,
          soapStatus,
          soapError,
          "create"
        ]
      );

    }
    console.log("---------------------------------------------->ticket_number");

    console.log(`SAP Retry processed: ${logs.length}`);

  } catch (err) {

    console.error("SAP Retry Error:", err.message);

  } finally {

    connection.release();

  }

};