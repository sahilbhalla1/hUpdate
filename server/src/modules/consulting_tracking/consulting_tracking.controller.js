const ConsultingService = require("./consulting_tracking.service");


exports.getconsultingtracking = async (req, res, next) => {
  try {
    const data = await ConsultingService.getconsultingtracking ();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};