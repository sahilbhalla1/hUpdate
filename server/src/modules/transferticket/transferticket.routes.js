const express = require('express');
const router = express.Router();
const controller = require("./transferticket.controller");

router.get('/', controller.getTransferredTickets);


module.exports = router;