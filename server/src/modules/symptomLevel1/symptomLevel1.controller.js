const symptomService = require("./symptomLevel1.service");

const fetchSymptomLevel1 = async (req, res, next) => {
    try {
        const { categoryId } = req.query;

        if (!categoryId) {
            return res.status(400).json({
                success: false,
                message: "categoryId is required",
            });
        }

        const data = await symptomService.getSymptomLevel1ByCategory(categoryId);

        res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { fetchSymptomLevel1 };
