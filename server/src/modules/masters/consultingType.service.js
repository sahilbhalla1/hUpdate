const db = require('../../config/db'); // adjust path if needed

exports.getConsultingTypes = async () => {
  const connection = await db.getConnection();

  try {
    const [rows] = await connection.execute(
      `SELECT 
          id,
          consulting_type_code AS code,
          consulting_type_name AS name
       FROM consulting_type_master
       WHERE status = 'ACTIVE'
       ORDER BY consulting_type_code ASC`
    );

    return rows;

  } finally {
    connection.release();
  }
};