const ticketService = require("./ticket.service");
const ticketSyncService = require("./ticket.sync.service");

exports.updateSoapOrder = async (req, res, next) => {
  try {
    const { OBJECT_ID } = req.body;

    if (!OBJECT_ID) {
      return res.status(400).json({
        success: false,
        message: "OBJECT_ID is required for update",
      });
    }

    const result = await ticketService.updateTicketSOAP(
      req.body,
      req.user
    );

    return res.status(200).json(result);

  } catch (error) {
    next(error);
  }
};

// exports.getServiceOrderSOAP = async (req, res, next) => {
//   try {
//     const result = await ticketService.getServiceOrderSOAP(req.body);

//     res.status(200).json(result);
//   } catch (error) {
//     next(error);
//   }
// };


exports.getStatusesByOrderType = async (req, res) => {
  try {
    const { orderType } = req.body;

    if (!orderType) {
      return res.status(400).json({
        success: false,
        message: 'orderType is required'
      });
    }

    const data = await ticketService.getStatusesByOrderType(orderType);

    return res.json({
      success: true,
      data
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.createTicket = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : 1;
    const userName = req.user?.name || 'admin'
    const result = await ticketService.createTicket(
      req.body,
      // req.user.id
      userId,
      userName
    );

    res.status(201).json(result);

  } catch (err) {
    console.error('Ticket creation error:', err);
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
}


exports.getStageByStatus = async (req, res) => {
  try {
    const { statusCode } = req.body;

    if (!statusCode) {
      return res.status(400).json({
        success: false,
        message: 'statusCode is required'
      });
    }

    const data = await ticketService.getStageByStatus(statusCode);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'Stage not found for given status'
      });
    }

    return res.json({
      success: true,
      data
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// exports.updateAgentRemark = async (req, res, next) => {
//   try {
//     const { ticketId } = req.params;
//     const { agentRemark, isL1, IS_CONSULTING, finalPayload } = req.body;
//     if (!agentRemark) {
//       throw new Error('agentRemark is required');
//     }

//     const userId = req.user?.id || 1; // adjust if using auth middleware
//     const userName = req.user?.name || 'admin'
//     const result = await ticketService.updateTicketAgentRemark(
//       ticketId,
//       agentRemark,
//       userId, isL1, IS_CONSULTING, finalPayload, userName
//     );

//     res.status(200).json(result);

//   } catch (error) {
//     next(error);
//   }
// };


// exports.updateAgentRemark = async (req, res, next) => {
//   try {

//     const { ticketId } = req.params;

//     const {
//       agentRemark,
//       isL1,
//       IS_CONSULTING,
//       finalPayload,
//       applicationType
//     } = req.body;

//     if (!agentRemark) {
//       throw new Error('agentRemark is required');
//     }

//     const userId = req.user?.id || 1;
//     const userName = req.user?.name || 'admin';

//     const result = await ticketService.updateTicketAgentRemark(
//       ticketId,
//       agentRemark,
//       userId,
//       isL1,
//       IS_CONSULTING,
//       finalPayload,
//       userName,
//       applicationType || null,   // ✅ normalize value
//       req.files || []
//     );

//     res.status(200).json(result);

//   } catch (error) {
//     next(error);
//   }
// };

exports.updateAgentRemark = async (req, res, next) => {
  try {

    const { ticketId } = req.params;

    const {
      agentRemark,
      isL1,
      IS_CONSULTING,
      finalPayload,
      applicationType
    } = req.body;

    if (!agentRemark) {
      throw new Error("agentRemark is required");
    }

    const userId = req.user?.id || 1;
    const userName = req.user?.name || "admin";

    // 🔥 MAP filesMeta -> correct fieldname
    let mappedFiles = [];

    if (req.files && req.files.length && req.body.filesMeta) {

      const metaArray = Array.isArray(req.body.filesMeta)
        ? req.body.filesMeta
        : [req.body.filesMeta];

      mappedFiles = req.files.map((file, index) => {

        const meta = JSON.parse(metaArray[index]);

        return {
          ...file,
          fieldname: meta.key
        };

      });

    }

    const result = await ticketService.updateTicketAgentRemark(
      ticketId,
      agentRemark,
      userId,
      isL1,
      IS_CONSULTING,
      finalPayload,
      userName,
      applicationType || null,
      mappedFiles
    );

    res.status(200).json(result);

  } catch (error) {
    next(error);
  }
};



exports.getRecentHistory = async (req, res, next) => {
  try {

    const { primaryPhone, externalTicketNumber } = req.query;

    const data = await ticketService.getRecentHistoryTickets({
      primaryPhone,
      externalTicketNumber
    });

    res.status(200).json({
      success: true,
      data
    });

  } catch (error) {
    next(error);
  }
};

exports.getTicketDetails = async (req, res, next) => {
  try {
    const { ticketId } = req.params;
    const { isExternal } = req.query;
    const field = isExternal
      ? 't.external_ticket_number'
      : 't.id';

    const data = await ticketService.getTicketFullDetails(ticketId, field);

    res.status(200).json({
      success: true,
      data
    });

  } catch (error) {
    next(error);
  }
};

exports.getL2Tickets = async (req, res, next) => {
  try {
    const data = await ticketService.getL2SlaTickets();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.getL3Tickets = async (req, res, next) => {
  try {
    const data = await ticketService.getL3SlaTickets();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.getTicketHistory = async (req, res, next) => {
  try {

    const { ticketId } = req.params;

    const data = await ticketService.getTicketHistory(ticketId);

    res.status(200).json({
      success: true,
      count: data.length,
      data
    });

  } catch (error) {
    next(error);
  }
};

exports.fetchSoapServiceOrder = async (req, res) => {
  const result = await ticketSyncService.syncServiceOrdersFromSAP(req.body);
  res.json(result);
};

exports.getTicketReportByDate = async (req, res) => {
  try {

    const { fromDate, toDate } = req.query;

    const data = await ticketService.getTicketReportByDate({
      fromDate,
      toDate
    });

    return res.status(200).json({
      success: true,
      count: data.length,
      data
    });

  } catch (error) {
    console.error('Report Error:', error);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.uploadAttachments = async (req, res) => {
  try {

    const { ticketId } = req.params;
    const { applicationType } = req.body;

    if (!applicationType) {
      return res.status(400).json({
        success: false,
        message: 'applicationType is required'
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one file required'
      });
    }

    const result = await ticketService.uploadAttachments({
      ticketId,
      applicationType,
      files: req.files,
      userId: req.user?.id || 1
    });

    res.status(201).json({
      success: true,
      data: result
    });

  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};


exports.getInternalValidationTickets = async (req, res, next) => {
  try {

    const result = await ticketService.getInternalValidationTickets();

    res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {
    next(error);
  }
};

exports.getTicketAttachments = async (req, res, next) => {
  try {

    const { ticketId } = req.params;

    if (!ticketId) {
      throw new Error("ticketId is required");
    }

    const result = await ticketService.getTicketAttachments(ticketId);

    res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {
    next(error);
  }
};

exports.validateTicketAttachments = async (req, res, next) => {
  try {

    const { ticketId } = req.params;
    const { attachments } = req.body;

    const userId = req.user?.id || 1;

    if (!attachments || !Array.isArray(attachments) || !attachments.length) {
      throw new Error("attachments array is required");
    }

    const result = await ticketService.validateTicketAttachments(
      ticketId,
      attachments,
      userId
    );

    res.status(200).json(result);

  } catch (error) {
    next(error);
  }
};

exports.getApplicationValidationDetails = async (req, res, next) => {
  try {

    const { ticketId } = req.params;
    const { applicationType, isExternal } = req.query;

    if (!applicationType) {
      throw new Error("applicationType is required");
    }

    const field = "t.external_ticket_number";
      // : "t.id";

    const data = await ticketService.getApplicationValidationDetails(
      ticketId,
      field,
      applicationType
    );

    res.status(200).json({
      success: true,
      data
    });

  } catch (error) {
    next(error);
  }
};