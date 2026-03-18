const express = require('express');
const router = express.Router();

const controller = require("./ticket.controller");
const authMiddleware = require('../../middleware/auth');
const upload = require('../../config/multer');

router.get('/:ticketId/application-validation', controller.getApplicationValidationDetails);

router.patch(
  '/:ticketId/agent-remark',
  upload.any(),
  controller.updateAgentRemark
);
// router.post("/:ticketId/attachments", upload.array("files", 10), controller.uploadAttachments);

// router.use(authMiddleware);
router.get(
  "/internal-validation-tickets",
  controller.getInternalValidationTickets
);

router.get(
  "/:ticketId/attachments",
  controller.getTicketAttachments
);
router.patch(
  "/:ticketId/attachments/validate",
  controller.validateTicketAttachments
);
router.post('/create', controller.createTicket);
router.post('/statuses', controller.getStatusesByOrderType);
router.post('/stage', controller.getStageByStatus);
// router.patch('/:ticketId/agent-remark', controller.updateAgentRemark);
router.get('/recent-history', controller.getRecentHistory);
router.get('/:ticketId/details', controller.getTicketDetails);

router.put('/update-soap-order', controller.updateSoapOrder);
router.post('/fetch-soap-service-order', controller.fetchSoapServiceOrder);

router.get('/sla/l2', controller.getL2Tickets);
router.get('/sla/l3', controller.getL3Tickets);

router.get('/:ticketId/history', controller.getTicketHistory);
// GET Ticket Report
router.get('/report', controller.getTicketReportByDate);

module.exports = router;
