const db = require("../../config/db");

const getSectionsBySymptomL2 = async (symptomL2Id) => {
    try {
        if (!symptomL2Id) {
            throw new Error("Symptom Level 2 ID is required");
        }

        const [rows] = await db.query(
            `
      SELECT 
        s.id,
        s.section_code,
        s.description
      FROM section_master s
      INNER JOIN section_symptom_l2_mapping m 
        ON s.id = m.section_id
      WHERE s.status = 'ACTIVE'
        AND m.symptom_l2_id = ?
      ORDER BY s.description ASC
      `,
            [symptomL2Id]
        );

        return rows;
    } catch (error) {
        console.error("Section DB Error:", error);
        throw error;
    }
};

module.exports = { getSectionsBySymptomL2 };
