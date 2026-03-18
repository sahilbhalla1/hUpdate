const express = require("express");
const router = express.Router();
const { fetchServiceTypes } = require("./serviceType.controller");

// Protected route
router.get("/", fetchServiceTypes);

module.exports = router;
