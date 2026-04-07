// const db = require("../../config/db");

// const getDefectsBySection = async (sectionId) => {
//     try {
//         if (!sectionId) {
//             throw new Error("Section ID is required");
//         }

//         const [rows] = await db.query(
//             `
//       SELECT 
//         id,
//         defect_code,
//         defect_description
//       FROM defect_master
//       WHERE status = 'ACTIVE'
//         AND section_id = ?
//       ORDER BY defect_description ASC
//       `,
//             [sectionId]
//         );

//         return rows;
//     } catch (error) {
//         console.error("Defect DB Error:", error);
//         throw error;
//     }
// };

// module.exports = { getDefectsBySection };
const db = require("../../config/db");

const getDefectsBySection = async (sectionId) => {
    try {
        if (!sectionId) {
            throw new Error("Section ID is required");
        }

        const [rows] = await db.query(
            `
            SELECT 
                d.id,
                d.defect_code,
                d.defect_description
            FROM section_defect_mapping sdm
            JOIN defect_master d
                ON d.id = sdm.defect_id
            WHERE sdm.section_id = ?
              AND d.status = 'ACTIVE'
            ORDER BY d.defect_description ASC
            `,
            [sectionId]
        );

        return rows;
    } catch (error) {
        console.error("Defect DB Error:", error);
        throw error;
    }
};

module.exports = { getDefectsBySection };