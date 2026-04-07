const ticketService = require("./ticket.service");
const ticketSyncService = require("./ticket.sync.service");
const db = require("../../config/db");

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

// exports.createTicket = async (req, res) => {
//   try {
//     const userId = req.user ? req.user.id : 1;
//     const userName = req.user?.name || 'admin'
//     const result = await ticketService.createTicket(
//       req.body,
//       // req.user.id
//       userId,
//       userName
//     );

//     res.status(201).json(result);

//   } catch (err) {
//     console.error('Ticket creation error:', err);
//     res.status(400).json({
//       success: false,
//       message: err.message
//     });
//   }
// }

exports.createTicket = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : 1;
    const userName = req.user?.name || 'admin';

    const result = await ticketService.createTicket(
      req.body,
      userId,
      userName
    );

    res.status(201).json(result);

  } catch (err) {
    console.error('Ticket creation error:', err);

    if (err.message.includes('already exists')) {
      return res.status(409).json({
        success: false,
        errorCode: "DUPLICATE_OPEN_TICKET",
        message: err.message
      });
    }

    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};


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

exports.checkDuplicateTicket = async (req, res, next) => {
  try {
    const { orderTypeCode, customerId, customerProductId, orderTypeId } = req.body;

    if (!orderTypeCode || !customerId || !customerProductId || !orderTypeId) {
      throw new Error("Missing required fields for duplicate check");
    }

    const data = await ticketService.checkDuplicateTicket(
      orderTypeCode,
      customerId,
      customerProductId,
      orderTypeId
    );

    res.status(200).json({
      success: true,
      data,
    });

  } catch (error) {
    next(error);
  }
};

exports.searchCustomerModel = async (req, res) => {
  try {
    const { model } = req.params;
 
    const query = `
      SELECT
        cm.id AS customerModelId,
        cm.model_number,
 
        ms.id AS modelSpecId,
        ms.spec_value,
 
        sc.id AS subCategoryId,
        sc.name AS subCategory,
 
        c.id AS categoryId,
        c.name AS category,
         c.code AS categoryCode   -- add this
 
      FROM customer_models cm
      JOIN model_specifications ms
        ON cm.model_spec_id = ms.id
      JOIN sub_categories sc
        ON ms.sub_category_id = sc.id
      JOIN categories c
        ON sc.category_id = c.id
 
      WHERE cm.model_number LIKE ?
      LIMIT 1
    `;
 
    const [rows] = await db.query(query, [`%${model}%`]);
 
    if (!rows.length) {
      return res.json({
        success: false,
        message: "Model not found"
      });
    }
 
    res.json({
      success: true,
      data: rows[0]
    });
 
  } catch (error) {
    console.error("Model Search Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

exports.getServiceRequestsByPhone = async (req, res) => {
  const { phone } = req.query;

  if (!phone || phone.length !== 10) {
    return res.status(400).json({
      success: false,
      message: "Valid phone number required",
    });
  }

  try {
    const [rows] = await db.execute(
      `
      SELECT 
        t.id,
        t.ticket_number,
        t.external_ticket_number,
        sm.status_description AS status,
        t.created_at
      FROM tickets t
      JOIN customers c ON c.id = t.customer_id
      JOIN order_type_master ot ON ot.id = t.order_type_id
      JOIN status_master sm ON sm.id = t.current_status_id

      WHERE c.primary_phone = ?
        AND ot.order_type = 'ZSV1'
        AND t.external_ticket_number IS NOT NULL

        -- only open SRs
      

      ORDER BY t.created_at DESC
      `,
      [phone]
    );

    return res.json({
      success: true,
      data: rows,
    });

  } catch (error) {
    console.error("SR Fetch Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch service requests",
    });
  }
};


exports.getServiceRequestsByPhone = async (req, res) => {
  const { phone } = req.query;

  if (!phone || phone.length !== 10) {
    return res.status(400).json({
      success: false,
      message: "Valid phone number required",
    });
  }

  try {
    const [rows] = await db.execute(
      `
      SELECT 
        t.id,
        t.ticket_number,
        t.external_ticket_number,
        sm.status_description AS status,
        t.created_at
      FROM tickets t
      JOIN customers c ON c.id = t.customer_id
      JOIN order_type_master ot ON ot.id = t.order_type_id
      JOIN status_master sm ON sm.id = t.current_status_id

      WHERE c.primary_phone = ?
        AND ot.order_type = 'ZSV1'
        AND t.external_ticket_number IS NOT NULL

        -- only open SRs
      

      ORDER BY t.created_at DESC
      `,
      [phone]
    );

    return res.json({
      success: true,
      data: rows,
    });

  } catch (error) {
    console.error("SR Fetch Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch service requests",
    });
  }
};