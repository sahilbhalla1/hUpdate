const db = require("../../config/db");

const getSymptomLevel2BySymptom1 = async (symptom1Id) => {
    try {
        if (!symptom1Id) {
            throw new Error("Symptom Level 1 ID is required");
        }

        const [rows] = await db.query(
            `
      SELECT 
        id,
        symptom_2_code,
        symptom_2_name
      FROM symptom_level_2_master
      WHERE status = 'ACTIVE'
        AND symptom_1_id = ?
      ORDER BY symptom_2_name ASC
      `,
            [symptom1Id]
        );

        return rows;
    } catch (error) {
        console.error("SymptomLevel2 DB Error:", error);
        throw error;
    }
};

module.exports = { getSymptomLevel2BySymptom1 };
