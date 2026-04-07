const express = require("express");
const router = express.Router();
const { getWarranty } = require("./warranty.controller");
// const authMiddleware = require("../../middleware/auth");

// Protected route (optional)
router.post("/get", getWarranty);

module.exports = router;
