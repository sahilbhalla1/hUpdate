const express = require('express');
const router = express.Router();
const controller = require('./master.controller');

// GET /api/masters/consulting-types
router.get('/consulting-types', controller.getConsultingTypes);

// GET /api/masters/complaint-types
router.get('/complaint-types', controller.getComplaintTypes);

module.exports = router;