const symptomLevel2Service = require("./symptomLevel2.service");

const fetchSymptomLevel2 = async (req, res, next) => {
    try {
        const { symptom1Id } = req.query;

        if (!symptom1Id) {
            return res.status(400).json({
                success: false,
                message: "symptom1Id is required",
            });
        }

        const data = await symptomLevel2Service.getSymptomLevel2BySymptom1(symptom1Id);

        res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { fetchSymptomLevel2 };
