const repairActionService = require("./repairAction.service");

const fetchRepairActions = async (req, res, next) => {
    try {
        const { defectId } = req.query;

        if (!defectId) {
            return res.status(400).json({
                success: false,
                message: "defectId is required",
            });
        }

        const data = await repairActionService.getRepairActionsByDefect(defectId);

        res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { fetchRepairActions };
