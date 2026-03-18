const resolverService = require('./resolver.service');

/**
 * Get all tickets assigned to the logged-in resolver
 * GET /api/resolver/tickets/my
 */
exports.getMyTickets = async (req, res) => {
    try {
        const resolverId = req.user.id; // Assuming user is attached by auth middleware

        const tickets = await resolverService.getMyTickets(resolverId);

        res.status(200).json({
            success: true,
            data: tickets,
        });
    } catch (error) {
        console.error('Error fetching my tickets:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch tickets',
        });
    }
};

/**
 * Get all available tickets for the resolver based on their journey assignments
 * GET /api/resolver/tickets/available
 */
exports.getAvailableTickets = async (req, res) => {
    try {
        const resolverId = req.user.id;
        console.log(resolverId)
        const tickets = await resolverService.getAvailableTickets(resolverId);

        res.status(200).json({
            success: true,
            data: tickets,
        });
    } catch (error) {
        console.error('Error fetching available tickets:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch available tickets',
        });
    }
};

/**
 * Get detailed information about a specific ticket
 * GET /api/resolver/tickets/:id
 */
exports.getTicketDetails = async (req, res) => {
    try {
        const resolverId = req.user.id;
        const ticketId = parseInt(req.params.id);

        if (isNaN(ticketId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid ticket ID',
            });
        }

        const ticket = await resolverService.getTicketDetails(ticketId, resolverId);

        res.status(200).json({
            success: true,
            data: ticket,
        });
    } catch (error) {
        console.error('Error fetching ticket details:', error);

        if (error.message === 'Ticket not found') {
            return res.status(404).json({
                success: false,
                message: 'Ticket not found',
            });
        }

        if (error.message === 'Unauthorized to view this ticket') {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to view this ticket',
            });
        }

        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch ticket details',
        });
    }
};

/**
 * Claim an available ticket
 * POST /api/resolver/tickets/:id/claim
 */
exports.claimTicket = async (req, res) => {
    try {
        const resolverId = req.user.id;
        const ticketId = parseInt(req.params.id);

        if (isNaN(ticketId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid ticket ID',
            });
        }

        const ticket = await resolverService.claimTicket(ticketId, resolverId);

        res.status(200).json({
            success: true,
            message: 'Ticket claimed successfully',
            data: ticket,
        });
    } catch (error) {
        console.error('Error claiming ticket:', error);

        if (error.message === 'Ticket not available or already assigned') {
            return res.status(409).json({
                success: false,
                message: 'This ticket is no longer available',
            });
        }

        res.status(500).json({
            success: false,
            message: error.message || 'Failed to claim ticket',
        });
    }
};

/**
 * Update ticket status
 * PUT /api/resolver/tickets/:id/status
 */
exports.updateTicketStatus = async (req, res) => {
    try {
        const resolverId = req.user.id;
        const ticketId = parseInt(req.params.id);
        const { status } = req.body;

        if (isNaN(ticketId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid ticket ID',
            });
        }

        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Status is required',
            });
        }

        const validStatuses = ['IN_PROGRESS', 'RESOLVED'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Allowed values: ${validStatuses.join(', ')}`,
            });
        }

        const ticket = await resolverService.updateTicketStatus(ticketId, status, resolverId);

        res.status(200).json({
            success: true,
            message: 'Ticket status updated successfully',
            data: ticket,
        });
    } catch (error) {
        console.error('Error updating ticket status:', error);

        if (error.message === 'Ticket not found or not assigned to you') {
            return res.status(404).json({
                success: false,
                message: 'Ticket not found or you do not have permission to update it',
            });
        }

        res.status(500).json({
            success: false,
            message: error.message || 'Failed to update ticket status',
        });
    }
};

/**
 * Add a remark to a ticket
 * POST /api/resolver/tickets/:id/remarks
 */
exports.addRemark = async (req, res) => {
    try {
        const resolverId = req.user.id;
        const ticketId = parseInt(req.params.id);
        const { remark } = req.body;

        if (isNaN(ticketId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid ticket ID',
            });
        }

        if (!remark || !remark.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Remark text is required',
            });
        }

        const remarkObj = await resolverService.addRemark(ticketId, remark.trim(), resolverId);

        res.status(201).json({
            success: true,
            message: 'Remark added successfully',
            data: remarkObj,
        });
    } catch (error) {
        console.error('Error adding remark:', error);

        if (error.message === 'Ticket not found or not assigned to you') {
            return res.status(404).json({
                success: false,
                message: 'Ticket not found or you do not have permission to add remarks',
            });
        }

        res.status(500).json({
            success: false,
            message: error.message || 'Failed to add remark',
        });
    }
};

/**
 * Escalate a ticket to the next level
 * POST /api/resolver/tickets/:id/escalate
 */
exports.escalateTicket = async (req, res) => {
    try {
        const resolverId = req.user.id;
        const ticketId = parseInt(req.params.id);
        const { reason } = req.body;

        if (isNaN(ticketId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid ticket ID',
            });
        }

        if (!reason || !reason.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Escalation reason is required',
            });
        }

        const result = await resolverService.escalateTicket(ticketId, resolverId, reason.trim());

        res.status(200).json({
            success: true,
            message: result.message,
            data: result,
        });
    } catch (error) {
        console.error('Error escalating ticket:', error);

        if (error.message === 'Ticket not found or not assigned to you') {
            return res.status(404).json({
                success: false,
                message: 'Ticket not found or you do not have permission to escalate it',
            });
        }

        if (error.message === 'No next escalation level configured') {
            return res.status(400).json({
                success: false,
                message: 'This ticket cannot be escalated further',
            });
        }

        res.status(500).json({
            success: false,
            message: error.message || 'Failed to escalate ticket',
        });
    }
};

/**
 * Get resolver statistics
 * GET /api/resolver/stats
 */
exports.getStats = async (req, res) => {
    try {
        const resolverId = req.user.id;

        const stats = await resolverService.getResolverStats(resolverId);

        res.status(200).json({
            success: true,
            data: stats,
        });
    } catch (error) {
        console.error('Error fetching resolver stats:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch statistics',
        });
    }
};

exports.performAction = async (req, res) => {
    try {
        const result = await resolverService.performAction(
            req.params.ticketId,
            req.user.id,
            req.body
        );
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to perform actions',
        });
    }
};
