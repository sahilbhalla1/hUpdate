const warrantyService = require("./warranty.service");

const getWarranty = async (req, res, next) => {
    try {
        const { PUR_CHAN, PUR_DATE, MODEL } = req.body;

        const result = await warrantyService.fetchWarranty({
            PUR_CHAN,
            PUR_DATE,
            MODEL,
        });

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { getWarranty };
