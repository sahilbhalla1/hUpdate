const db = require("../../config/db");

const getServiceTypes = async () => {
    try {
        const [rows] = await db.query(`
      SELECT 
    id,
    service_type_code,
    service_type_name
  FROM service_type_master
  WHERE status = 'ACTIVE'
  ORDER BY service_type_name ASC
    `);

        return rows;
    } catch (error) {
        console.error("ServiceType DB Error:", error);
        throw error;
    }
};

module.exports = { getServiceTypes };
