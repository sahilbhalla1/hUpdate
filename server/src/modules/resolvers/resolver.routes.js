const express = require('express');
const router = express.Router();
const resolverController = require('./resolver.controller');
const authMiddleware = require('../../middleware/auth');

/**
 * All routes require authentication and RESOLVER/DEPT_ADMIN/ADMIN role
 */
router.use(authMiddleware);
// router.use(authorizeRoles('RESOLVER', 'DEPT_ADMIN', 'ADMIN'));

/**
 * @route   GET /api/resolver/stats
 * @desc    Get resolver statistics
 * @access  Private (Resolver, Dept Admin, Admin)
 */
router.get('/stats', resolverController.getStats);

/**
 * @route   GET /api/resolver/tickets/available
 * @desc    Get all available tickets for the resolver
 * @access  Private (Resolver, Dept Admin, Admin)
 */
router.get('/tickets/available', resolverController.getAvailableTickets);

/**
 * @route   GET /api/resolver/tickets/my
 * @desc    Get all tickets assigned to the resolver
 * @access  Private (Resolver, Dept Admin, Admin)
 */
router.get('/tickets/my', resolverController.getMyTickets);

/**
 * @route   GET /api/resolver/tickets/:id
 * @desc    Get detailed information about a specific ticket
 * @access  Private (Resolver, Dept Admin, Admin)
 */
router.get('/tickets/:id', resolverController.getTicketDetails);

/**
 * @route   POST /api/resolver/tickets/:id/claim
 * @desc    Claim an available ticket
 * @access  Private (Resolver, Dept Admin, Admin)
 */
router.post('/tickets/:id/claim', resolverController.claimTicket);

/**
 * @route   POST /resolvers/tickets/:ticketId/action
 * @desc    Escalate a ticket to the next level,Add a remark,Update ticket status
 * @access  Private (Resolver, Dept Admin, Admin)
 */

router.post("/tickets/:ticketId/action", resolverController.performAction);


module.exports = router;