const db = require('../../config/db');

exports.getComplaintTypes = async () => {
  const connection = await db.getConnection();

  try {
    const [rows] = await connection.execute(
      `SELECT 
          id,
          complaint_type_code AS code,
          complaint_type_name AS name
       FROM complaint_type_master
       WHERE status = 'ACTIVE'
       ORDER BY complaint_type_code ASC`
    );

    return rows;

  } finally {
    connection.release();
  }
};