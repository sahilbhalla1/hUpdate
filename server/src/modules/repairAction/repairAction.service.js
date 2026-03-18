// const db = require("../../config/db");

// const getRepairActionsByDefect = async (defectId) => {
//     try {
//         if (!defectId) {
//             throw new Error("Defect ID is required");
//         }

//         const [rows] = await db.query(
//             `
//       SELECT 
//         id,
//         repair_code,
//         repair_description
//       FROM repair_action_master
//       WHERE status = 'ACTIVE'
//         AND defect_id = ?
//       ORDER BY repair_description ASC
//       `,
//             [defectId]
//         );

//         return rows;
//     } catch (error) {
//         console.error("RepairAction DB Error:", error);
//         throw error;
//     }
// };

// module.exports = { getRepairActionsByDefect };
const db = require("../../config/db");

const getRepairActionsByDefect = async (defectId) => {
    try {
        if (!defectId) {
            throw new Error("Defect ID is required");
        }

        const [rows] = await db.query(
            `
            SELECT 
                r.id,
                r.repair_code,
                r.repair_description
            FROM defect_repair_mapping drm
            JOIN repair_action_master r
                ON r.id = drm.repair_action_id
            WHERE drm.defect_id = ?
              AND drm.status = 'ACTIVE'
              AND r.status = 'ACTIVE'
            ORDER BY r.repair_description ASC
            `,
            [defectId]
        );

        return rows;
    } catch (error) {
        console.error("RepairAction DB Error:", error);
        throw error;
    }
};

module.exports = { getRepairActionsByDefect };