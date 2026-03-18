const sectionService = require("./section.service");

const fetchSections = async (req, res, next) => {
    try {
        const { symptomL2Id } = req.query;

        if (!symptomL2Id) {
            return res.status(400).json({
                success: false,
                message: "symptomL2Id is required",
            });
        }

        const data = await sectionService.getSectionsBySymptomL2(symptomL2Id);

        res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { fetchSections };
