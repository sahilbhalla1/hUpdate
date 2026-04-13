const db = require("../../config/db");

exports.getconsultingtracking = async () => {

  const connection = await db.getConnection();

  try {

    const [rows] = await connection.execute(`
      SELECT
        t.id AS ticketId,
        t.external_ticket_number AS externalTicketNumber,
        sm.status_description AS ticketStatus,
        sm.status_code AS statusCode,
        ot.order_type_name AS orderType,
        os.source_name AS orderSource,   -- added
        u.name AS createdBy,
        DATE_FORMAT(t.created_at, '%d-%m-%Y %H:%i') AS createdAt

      FROM tickets t

      JOIN order_type_master ot
        ON ot.id = t.order_type_id

      JOIN status_master sm
        ON sm.id = t.current_status_id

      LEFT JOIN users u
        ON u.id = t.created_by

      LEFT JOIN order_source_master os   -- added
        ON os.id = t.order_source_id

      WHERE ot.order_type = 'ZWO4'
        AND ot.order_type_name = 'Consulting'

        -- Only Open and In Process
        AND sm.status_code IN ('E0001','E0002')

      ORDER BY t.created_at DESC
    `);

    return rows;

  } finally {
    connection.release();
  }
};



// exports.getconsultingtracking = async () => {

//   const connection = await db.getConnection();

//   try {

//     const [rows] = await connection.execute(`
//       SELECT
//         t.id AS ticketId,
//         t.external_ticket_number AS externalTicketNumber,
//         sm.status_description AS ticketStatus,
//         sm.status_code AS statusCode,
//         ot.order_type_name AS orderType,
//         u.name AS createdBy,
//         DATE_FORMAT(t.created_at, '%d-%m-%Y %H:%i') AS createdAt

//       FROM tickets t

//       JOIN order_type_master ot
//         ON ot.id = t.order_type_id

//       JOIN status_master sm
//         ON sm.id = t.current_status_id

//       LEFT JOIN users u
//         ON u.id = t.created_by

//       WHERE ot.order_type = 'ZWO4'
//         AND ot.order_type_name = 'Consulting'
//         AND sm.status_code IN ('E0001','E0002')

//       ORDER BY t.created_at DESC
//     `);

//     return rows;

//   } finally {
//     connection.release();
//   }
// };




// exports.getconsultingtracking = async () => {
//    const connection = await db.getConnection();

//   try {

//     const [rows] = await connection.execute(`
//       SELECT
//         t.id AS ticketId,
//         t.external_ticket_number AS externalTicketNumber,
//         sm.status_description AS ticketStatus,
//         sm.status_code AS statusCode,
//         ot.order_type_name AS orderType,
//         DATE_FORMAT(t.created_at, '%d-%m-%Y %H:%i') AS createdAt
//       FROM tickets t

//       JOIN order_type_master ot
//         ON ot.id = t.order_type_id

//       JOIN status_master sm
//         ON sm.id = t.current_status_id

//       WHERE ot.order_type = 'ZWO4'
//         AND ot.order_type_name = 'Consulting'

//         -- Only Open and In Process
//         AND sm.status_code IN ('E0001','E0002')

//       ORDER BY t.created_at DESC
//     `);

//     return rows.map(row => ({
//       ticketId: row.ticketId,
//       externalTicketNumber: row.externalTicketNumber,
//       orderType: row.orderType,
//       ticketStatus: row.ticketStatus,
//       statusCode: row.statusCode,
//       createdAt: row.createdAt
//     }));

//   } finally {
//     connection.release();
//   }
// };