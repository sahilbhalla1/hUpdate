const express = require('express');
const router = express.Router();
const controller = require("./consulting_tracking.controller");

router.get('/consulting-tracking', controller.getconsultingtracking);


module.exports = router;