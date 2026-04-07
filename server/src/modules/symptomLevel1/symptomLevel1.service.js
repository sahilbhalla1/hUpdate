const db = require("../../config/db");

const getSymptomLevel1ByCategory = async (categoryId) => {
    try {
        if (!categoryId) {
            throw new Error("Category ID is required");
        }

        const [rows] = await db.query(
            `
      SELECT 
        id,
        symptom_1_code,
        symptom_1_name
      FROM symptom_level_1_master
      WHERE status = 'ACTIVE'
        AND category_id = ?
      ORDER BY symptom_1_name ASC
      `,
            [categoryId]
        );

        return rows;
    } catch (error) {
        console.error("SymptomLevel1 DB Error:", error);
        throw error;
    }
};

module.exports = { getSymptomLevel1ByCategory };
