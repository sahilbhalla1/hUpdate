const orderTypeService = require("./orderType.service");

const fetchOrderTypes = async (req, res, next) => {
    try {
        const data = await orderTypeService.getOrderTypes();

        res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { fetchOrderTypes };
