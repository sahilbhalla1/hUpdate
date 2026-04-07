const db = require("../../config/db");

const getOrderTypes = async () => {
    try {
        const [rows] = await db.query(`
     SELECT 
    id,
    order_type,
    order_type_name,
    default_sla
FROM order_type_master
WHERE status = 'ACTIVE'
ORDER BY 
    CASE order_type_name
        WHEN 'Consulting' THEN 1
        WHEN 'Service Request' THEN 2
        WHEN 'Complaint - Escalation' THEN 3
        ELSE 4
    END;
    `);

        return rows;
    } catch (error) {
        console.error("OrderType DB Error:", error);
        throw error;
    }
};

module.exports = { getOrderTypes };
