const express = require("express");
const router = express.Router();
const csatController = require("./csat.controller");

// 🔓 PUBLIC ROUTES (NO AUTH)
router.get("/:token", csatController.getQuestions);
router.post("/:token", csatController.submit);

module.exports = router;
