const defectService = require("./defect.service");

const fetchDefects = async (req, res, next) => {
    try {
        const { sectionId } = req.query;

        if (!sectionId) {
            return res.status(400).json({
                success: false,
                message: "sectionId is required",
            });
        }

        const data = await defectService.getDefectsBySection(sectionId);

        res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { fetchDefects };
