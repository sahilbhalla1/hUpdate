const serviceTypeService = require("./serviceType.service");

const fetchServiceTypes = async (req, res, next) => {
    try {
        const data = await serviceTypeService.getServiceTypes();

        res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { fetchServiceTypes };
