const db = require("../../config/db");

const getOrderSources = async () => {
    try {
        const [rows] = await db.query(`
      SELECT 
        id,
        source_code,
        source_name
      FROM order_source_master
      WHERE status = 'ACTIVE'
      ORDER BY source_name ASC
    `);

        return rows;
    } catch (error) {
        console.error("OrderSource DB Error:", error);
        throw error;
    }
};

module.exports = { getOrderSources };
