const db = require('../../config/db');
const { applyEscalation } = require("../escalation/escalation.core");
/* ====================================================
   RESOLVER SERVICE
   Handles ticket assignment, updates, and resolver operations
==================================================== */

/**
 * Get all tickets assigned to a specific resolver
 * @param {number} resolverId - The resolver's user ID
 * @returns {Array} List of tickets
 */
exports.getMyTickets = async (resolverId) => {
    const [tickets] = await db.query(
        `SELECT t.id,t.status, t.created_at,

        j.name AS journey_name,
        d.name AS department_name,
        c.name AS category_name,
        i.name AS issue_name,
      
        u.name  AS created_by_name,
        u.email AS created_by_email,
      
        ts.level AS current_tat_level,
        ts.tat_hours,
        ts.started_at,
        ts.due_at,
      
        TIMESTAMPDIFF(MINUTE, NOW(), ts.due_at) AS minutes_remaining,
        CASE
          WHEN NOW() > ts.due_at THEN 1
          ELSE 0
        END AS is_breached      

        FROM tickets t      

        -- SLA state (single source of truth)
        JOIN ticket_tat_state ts
        ON ts.ticket_id = t.id      

        -- Journey & hierarchy
        JOIN journeys j
        ON j.id = t.journey_id
        LEFT JOIN departments d
        ON d.id = t.department_id
        LEFT JOIN categories c
        ON c.id = t.category_id
        LEFT JOIN issues i
        ON i.id = t.issue_id      

        -- Created by
        LEFT JOIN users u
          ON u.id = t.created_by      

        -- Level safety (same as unassigned query)
        JOIN journey_tat_levels jt
         ON jt.journey_id = t.journey_id
         AND jt.level = ts.level      

        WHERE t.assigned_to = ?
          AND t.status NOT IN ('RESOLVED', 'CLOSED')
        
        GROUP BY t.id
        
        ORDER BY
          is_breached DESC,
          ts.due_at ASC,
          t.created_at ASC;`
        ,
        [resolverId]
    );

    return tickets;
};

/**
 * Get all available tickets for journeys where resolver is assigned
 * Uses first-come-first-serve logic - unassigned tickets from resolver's journeys
 * @param {number} resolverId - The resolver's user ID
 * @returns {Array} List of available tickets
 */
exports.getAvailableTickets = async (resolverId) => {
    const [tickets] = await db.query(
        ` SELECT t.id, t.status, t.created_at,

       j.name AS journey_name,
       d.name AS department_name,
       c.name AS category_name,
       i.name AS issue_name,     

       u.name  AS created_by_name,
       u.email AS created_by_email,     

       ts.level AS current_tat_level,
       ts.tat_hours,
       ts.started_at,
       ts.due_at,     

       TIMESTAMPDIFF(MINUTE, NOW(), ts.due_at) AS minutes_remaining,
       CASE
         WHEN NOW() > ts.due_at THEN 1
         ELSE 0
       END AS is_breached     

       FROM tickets t

      -- SLA state (single source of truth)
      JOIN ticket_tat_state ts
        ON ts.ticket_id = t.id
      
      -- Journey & hierarchy
      JOIN journeys j
        ON j.id = t.journey_id
      LEFT JOIN departments d
        ON d.id = t.department_id
      LEFT JOIN categories c
        ON c.id = t.category_id
      LEFT JOIN issues i
        ON i.id = t.issue_id
      
      -- Created by
      LEFT JOIN users u
        ON u.id = t.created_by
      
      -- Resolver level matching (CRITICAL)
      JOIN journey_tat_levels jt
        ON jt.journey_id = t.journey_id
       AND jt.level = ts.level
      
      JOIN journey_resolvers jr
        ON jr.tat_level_id = jt.id
      
      WHERE
        jr.user_id = ?
        AND t.assigned_to IS NULL
        AND t.status NOT IN ('RESOLVED', 'CLOSED')
      
      GROUP BY t.id
      
      ORDER BY
        is_breached DESC,
        ts.due_at ASC,
        t.created_at ASC;
          `
        ,
        [resolverId]
    );

    return tickets;
};

/**
 * Get detailed ticket information for resolver view
 * @param {number} ticketId - The ticket ID
 * @param {number} resolverId - The resolver's user ID (for authorization)
 * @returns {Object} Detailed ticket information
 */
exports.getTicketDetails = async (ticketId, resolverId) => {
    // Get ticket basic info
    const [[ticket]] = await db.query(
        `
  SELECT
    t.id,
    t.status,
    t.created_at,
    t.assigned_to,

    j.name AS journey_name,
    d.name AS department_name,
    c.name AS category_name,
    i.name AS issue_name,

    u.name  AS created_by_name,
    u.email AS created_by_email,
    u.phone AS created_by_phone,

    tts.level AS current_tat_level,
    tts.tat_hours,
    tts.started_at,
    tts.due_at,

    TIMESTAMPDIFF(MINUTE, NOW(), tts.due_at) AS minutes_remaining,
    CASE
      WHEN NOW() > tts.due_at THEN 1
      ELSE 0
    END AS is_breached,

    ar.name AS assigned_resolver_name,

    EXISTS (
      SELECT 1
      FROM journey_tat_levels jtl2
      WHERE jtl2.journey_id = t.journey_id
        AND jtl2.level = tts.level + 1
    ) AS has_next_level

  FROM tickets t
  JOIN journeys j ON t.journey_id = j.id
  LEFT JOIN departments d ON t.department_id = d.id
  LEFT JOIN categories c ON t.category_id = c.id
  LEFT JOIN issues i ON t.issue_id = i.id
  LEFT JOIN users u ON t.created_by = u.id
  JOIN ticket_tat_state tts ON t.id = tts.ticket_id
  LEFT JOIN users ar ON t.assigned_to = ar.id
  WHERE t.id = ?
  `,
        [ticketId]
    );

    if (!ticket) {
        throw new Error('Ticket not found');
    }

    // Check authorization - resolver can only view tickets from their journeys or assigned to them
    const [[authCheck]] = await db.query(
        `
    SELECT 1
    FROM tickets t
    INNER JOIN journey_tat_levels jtl ON t.journey_id = jtl.journey_id
    INNER JOIN journey_resolvers jr ON jtl.id = jr.tat_level_id
    WHERE t.id = ?
      AND (jr.user_id = ? OR t.assigned_to = ?)
    LIMIT 1
    `,
        [ticketId, resolverId, resolverId]
    );

    if (!authCheck) {
        throw new Error('Unauthorized to view this ticket');
    }

    // Get custom field answers
    const [customFields] = await db.query(
        `
    SELECT
      cf.label,
      cf.type,
      cf.group_id,
      gcf.name AS group_name,
      tcfa.answer
    FROM ticket_custom_field_answers tcfa
    INNER JOIN custom_fields cf ON tcfa.field_id = cf.id
    LEFT JOIN group_custom_fields gcf ON cf.group_id = gcf.id
    WHERE tcfa.ticket_id = ?
    ORDER BY cf.field_order
    `,
        [ticketId]
    );

    // Get remarks/timeline
    const [remarks] = await db.query(
        `
    SELECT 
      tr.*,
      u.name AS created_by_name
    FROM ticket_remarks tr
    LEFT JOIN users u ON tr.remarked_by = u.id
    WHERE tr.ticket_id = ?
    ORDER BY tr.created_at DESC
    `,
        [ticketId]
    );

    // Get status history
    // const [statusHistory] = await db.query(
    //     `
    // SELECT 
    //   tsh.*,
    //   u.name AS changed_by_name
    // FROM ticket_status_history tsh
    // LEFT JOIN users u ON tsh.changed_by = u.id
    // WHERE tsh.ticket_id = ?
    // ORDER BY tsh.created_at DESC
    // `,
    //     [ticketId]
    // );

    return {
        ...ticket,
        custom_fields: customFields,
        remarks,
        // status_history: statusHistory,
    };
};

/**
 * Assign ticket to resolver (claim ticket)
 * @param {number} ticketId - The ticket ID
 * @param {number} resolverId - The resolver's user ID
 * @returns {Object} Updated ticket
 */
exports.claimTicket = async (ticketId, resolverId) => {
    const conn = await db.getConnection();

    try {
        await conn.beginTransaction();

        // Verify ticket is available and resolver can claim it
        const [[ticket]] = await conn.query(
            `
      SELECT
    t.id,
    t.status,
    tts.level
  FROM tickets t
  INNER JOIN ticket_tat_state tts
    ON t.id = tts.ticket_id
  INNER JOIN journey_tat_levels jtl
    ON t.journey_id = jtl.journey_id
   AND tts.level = jtl.level
  INNER JOIN journey_resolvers jr
    ON jtl.id = jr.tat_level_id
  WHERE t.id = ?
    AND t.assigned_to IS NULL
    AND t.status NOT IN ('CLOSED', 'RESOLVED')
    AND jr.user_id = ?
  FOR UPDATE
      `,
            [ticketId, resolverId]
        );

        if (!ticket) {
            throw new Error('Ticket cannot be claimed (already assigned, closed, or not at your level)');
        }

        // Update ticket assignment
        await conn.query(
            ` UPDATE tickets SET assigned_to = ?, status = 'IN_PROGRESS', updated_at = NOW() WHERE id = ?`,
            [resolverId, ticketId]
        );

        // Record in ticket_assignees
        await conn.query(
            ` INSERT INTO ticket_assignees (ticket_id, user_id, level, assigned_at) VALUES (?, ?, ?, NOW()) `,
            [ticketId, resolverId, ticket.level]
        );

        // Add status change history
        await conn.query(
            `INSERT INTO ticket_status_history (ticket_id, old_status, new_status, changed_by)
             VALUES (?, 'OPEN', 'IN_PROGRESS', ?) `,
            [ticketId, resolverId]
        );

        // Add system remark
        await conn.query(
            `INSERT INTO ticket_remarks (ticket_id, remark, remarked_by)
             VALUES (?, 'Ticket claimed and moved to In Progress', ?)`,
            [ticketId, resolverId]
        );

        await conn.commit();

        // Return updated ticket
        return await exports.getTicketDetails(ticketId, resolverId);

    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
};

/**
 * Update ticket status
 * @param {number} ticketId - The ticket ID
 * @param {string} newStatus - New status (IN_PROGRESS, RESOLVED)
 * @param {number} resolverId - The resolver's user ID
 * @returns {Object} Updated ticket
 */
exports.updateTicketStatus = async (conn, ticket, newStatus, resolverId) => {
    const oldStatus = ticket.status;

    await conn.query(
        `
    UPDATE tickets
    SET status = ?,
        updated_at = NOW(),
        resolved_at = CASE WHEN ? = 'RESOLVED' THEN NOW() ELSE resolved_at END,
        resolved_by = CASE WHEN ? = 'RESOLVED' THEN ? ELSE resolved_by END
    WHERE id = ?
    `,
        [newStatus, newStatus, newStatus, resolverId, ticket.id]
    );

    await conn.query(
        `
        INSERT INTO ticket_status_history
          (ticket_id, old_status, new_status, changed_by)
        VALUES (?, ?, ?, ?)
        `,
        [ticket.id, oldStatus, newStatus, resolverId]
    );
};

/**
 * Add remark to ticket
 * @param {number} ticketId - The ticket ID
 * @param {string} remarkText - The remark text
 * @param {number} resolverId - The resolver's user ID
 * @returns {Object} Created remark
 */
exports.addRemark = async (ticketId, remarkText, resolverId) => {
    const conn = await db.getConnection();

    try {
        await conn.beginTransaction();

        // Verify resolver has access to this ticket
        const [[ticket]] = await conn.query(
            `
      SELECT * FROM tickets
      WHERE id = ? AND assigned_to = ?
      `,
            [ticketId, resolverId]
        );

        if (!ticket) {
            throw new Error('Ticket not found or not assigned to you');
        }

        // Add remark
        const [result] = await conn.query(
            `
      INSERT INTO ticket_remarks (ticket_id, remark, created_by)
      VALUES (?, ?, ?)
      `,
            [ticketId, remarkText, resolverId]
        );

        // Update ticket timestamp
        await conn.query(
            `
      UPDATE tickets
      SET updated_at = NOW()
      WHERE id = ?
      `,
            [ticketId]
        );

        await conn.commit();

        // Return created remark
        const [[remark]] = await conn.query(
            `
      SELECT 
        tr.*,
        u.name AS created_by_name,
        u.role AS created_by_role
      FROM ticket_remarks tr
      LEFT JOIN users u ON tr.created_by = u.id
      WHERE tr.id = ?
      `,
            [result.insertId]
        );

        return remark;

    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
};

/**
 * Get resolver statistics
 * @param {number} resolverId - The resolver's user ID
 * @returns {Object} Resolver statistics
 */
exports.getResolverStats = async (resolverId) => {
    const [[stats]] = await db.query(
        `
    SELECT 
      COUNT(CASE WHEN status = 'OPEN' THEN 1 END) AS open_count,
      COUNT(CASE WHEN status = 'IN_PROGRESS' THEN 1 END) AS in_progress_count,
      COUNT(CASE WHEN status = 'RESOLVED' THEN 1 END) AS resolved_count,
      COUNT(CASE WHEN status = 'ESCALATED' THEN 1 END) AS escalated_count,
      COUNT(CASE 
        WHEN EXISTS (
          SELECT 1 FROM ticket_tat_state tts 
          WHERE tts.ticket_id = t.id AND NOW() > tts.due_at
        ) AND status NOT IN ('CLOSED', 'RESOLVED')
        THEN 1 
      END) AS breached_count,
      AVG(CASE 
        WHEN status = 'RESOLVED' 
        THEN TIMESTAMPDIFF(HOUR, created_at, resolved_at) 
      END) AS avg_resolution_hours
    FROM tickets t
    WHERE assigned_to = ?
    `,
        [resolverId]
    );

    return stats;
};

/**
 * Escalate ticket to next level
 * @param {number} ticketId - The ticket ID
 * @param {number} resolverId - The resolver's user ID
 * @param {string} escalationReason - Reason for escalation
 * @returns {Object} Updated ticket
 */



exports.escalateTicket = async (conn, ticket, resolverId, reason) => {
    const [[nextLevel]] = await conn.query(
        `
    SELECT id, level, tat_hours
    FROM journey_tat_levels
    WHERE journey_id = ? AND level = ?
    `,
        [ticket.journey_id, ticket.level + 1]
    );

    if (!nextLevel) {
        throw new Error("No next escalation level configured");
    }

    await applyEscalation({
        conn,
        ticket,
        nextLevel,
        reason: `Manual escalation: ${reason}`,
        triggeredBy: "MANUAL",
        actorId: resolverId,
    });
};


// exports.escalateTicket = async (conn, ticket, resolverId, reason) => {
//     const [[nextLevel]] = await conn.query(
//         `
//         SELECT id, level, tat_hours
//         FROM journey_tat_levels
//         WHERE journey_id = ? AND level = ?
//         `,
//         [ticket.journey_id, ticket.level + 1]
//     );

//     if (!nextLevel) {
//         throw new Error('No next escalation level configured');
//     }

//     const startedAt = new Date();
//     const dueAt = new Date(startedAt.getTime() + nextLevel.tat_hours * 60 * 60 * 1000);

//     await conn.query(
//         `
//         UPDATE ticket_tat_state
//         SET level = ?, tat_hours = ?, started_at = ?, due_at = ?
//         WHERE ticket_id = ?
//         `,
//         [nextLevel.level, nextLevel.tat_hours, startedAt, dueAt, ticket.id]
//     );

//     await conn.query(
//         `
//         UPDATE tickets
//         SET status = 'ESCALATED',
//             assigned_to = NULL,
//             updated_at = NOW()
//         WHERE id = ?
//         `,
//         [ticket.id]
//     );

//     await conn.query(
//         `
//         INSERT INTO ticket_status_history
//           (ticket_id, old_status, new_status, changed_by)
//         VALUES (?, ?, 'ESCALATED', ?)
//         `,
//         [ticket.id, ticket.status, resolverId]
//     );

//     await conn.query(
//         `
//         INSERT INTO ticket_remarks (ticket_id, remark, remarked_by)
//         VALUES (?, ?, ?)
//         `,
//         [ticket.id, `Escalated: ${reason}`, resolverId]
//     );
// };

exports.performAction = async (ticketId, resolverId, { actionType, status, remark }) => {
    const conn = await db.getConnection();

    try {
        await conn.beginTransaction();

        // 🔒 SINGLE LOCK POINT
        const [[ticket]] = await conn.query(
            `
            SELECT t.*, tts.level
            FROM tickets t
            INNER JOIN ticket_tat_state tts ON t.id = tts.ticket_id
            WHERE t.id = ? AND t.assigned_to = ?
            FOR UPDATE
            `,
            [ticketId, resolverId]
        );

        if (!ticket) {
            throw new Error("Ticket not found or unauthorized");
        }

        if (actionType === "ESCALATE") {
            if (!remark) {
                throw new Error("Remark required for escalation");
            }

            await exports.escalateTicket(conn, ticket, resolverId, remark);
        }

        if (actionType === "STATUS") {
            if (status === "RESOLVED" && !remark) {
                throw new Error("Remark required for resolving ticket");
            }

            await exports.updateTicketStatus(conn, ticket, status, resolverId);

            if (remark) {
                await conn.query(
                    `INSERT INTO ticket_remarks (ticket_id, remark, remarked_by)
                     VALUES (?, ?, ?)`,
                    [ticket.id, remark, resolverId]
                );
            }
        }

        await conn.commit();
        return { success: true };

    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
};