const tranferTicketService = require("./transferticket.service");



exports.getTransferredTickets = async (req, res) => {
  try {
 
    const result = await tranferTicketService.getTransferredTickets();
 
    res.json({
      success: true,
      data: result
    });
 
  } catch (err) {
 
    res.status(500).json({
      success: false,
      message: err.message
    });
 
  }
};