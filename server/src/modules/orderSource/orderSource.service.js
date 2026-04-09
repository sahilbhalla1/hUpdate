const db = require("../../config/db");

// const getOrderSources = async () => {
//     try {
//         const [rows] = await db.query(`
//       SELECT 
//         id,
//         source_code,
//         source_name
//       FROM order_source_master
//       WHERE status = 'ACTIVE'
//       ORDER BY source_name ASC
//     `);

//         return rows;
//     } catch (error) {
//         console.error("OrderSource DB Error:", error);
//         throw error;
//     }
// };


const getOrderSources = async (orderType) => {
    try {
        let query = `
            SELECT 
                osm.id,
                osm.source_code,
                osm.source_name
            FROM order_source_master osm
            WHERE osm.status = 'ACTIVE'
        `;

        const params = [];

        // ✅ Only filter if NOT Service Request
        if (orderType !== "ZSV1") {
            query += `
                AND EXISTS (
                    SELECT 1
                    FROM order_source_order_type_map map
                    JOIN order_type_master otm 
                      ON otm.id = map.order_type_id
                    WHERE map.source_id = osm.id
                      AND map.status = 'ACTIVE'
                      AND otm.order_type = ?
                )
            `;
            params.push(orderType);
        }

        query += ` ORDER BY osm.source_name ASC`;

        const [rows] = await db.query(query, params);

        return rows;
    } catch (error) {
        console.error("OrderSource DB Error:", error);
        throw error;
    }
};

module.exports = { getOrderSources };
