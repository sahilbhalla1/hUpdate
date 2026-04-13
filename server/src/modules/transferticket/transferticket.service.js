const db = require("../../config/db");

exports.getTransferredTickets = async () => {
 
  const connection = await db.getConnection();
 
  try {
 
    const [rows] = await connection.execute(
      `
      SELECT
 
        ot.order_type_name AS orderType,
 
        t.id AS ticketId,
 
        os.source_name AS orderSource,
 
        DATE_FORMAT(t.created_at, '%d-%m-%Y %H:%i') AS createdAt
 
      FROM tickets t
 
      JOIN order_type_master ot
        ON ot.id = t.order_type_id
 
      JOIN order_source_master os
        ON os.id = t.order_source_id
 
      WHERE t.is_transferred = TRUE
        AND t.transfer_status IN ('PENDING','OPENED')
 
      ORDER BY t.created_at DESC
      `
    );
 
    return rows.map(row => ({
      orderType: row.orderType,
      ticketId: row.ticketId,
      orderSource: row.orderSource,
      createdAt: row.createdAt
    }));
 
  } finally {
    connection.release();
  }
};