const consultingService = require('./consultingType.service');
const complaintService = require('./complaintType.service');

exports.getConsultingTypes = async (req, res, next) => {
  try {
    const data = await consultingService.getConsultingTypes();

    res.status(200).json({
      success: true,
      data
    });

  } catch (error) {
    next(error);
  }
};

exports.getComplaintTypes = async (req, res, next) => {
  try {
    const data = await complaintService.getComplaintTypes();

    res.status(200).json({
      success: true,
      data
    });

  } catch (error) {
    next(error);
  }
};