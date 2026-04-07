const express = require("express");
const router = express.Router();
const customerController = require("./customer.controller");

router.get("/by-phone/:phone", customerController.getCustomerByPhone);

module.exports = router;
