const orderSourceService = require("./orderSource.service");

const fetchOrderSources = async (req, res, next) => {
    try {
        const data = await orderSourceService.getOrderSources();

        res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { fetchOrderSources };
