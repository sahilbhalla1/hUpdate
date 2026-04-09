const orderSourceService = require("./orderSource.service");

// const fetchOrderSources = async (req, res, next) => {
//     try {
//         const data = await orderSourceService.getOrderSources();

//         res.status(200).json({
//             success: true,
//             data,
//         });
//     } catch (error) {
//         next(error);
//     }
// };

const fetchOrderSources = async (req, res, next) => {
    try {
        let { orderType } = req.query;

        // ✅ Normalize input
        orderType = orderType?.trim();

        // ✅ Default fallback → Service Request
        if (!orderType) {
            orderType = "ZSV1";
        }

        const data = await orderSourceService.getOrderSources(orderType);

        res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { fetchOrderSources };
