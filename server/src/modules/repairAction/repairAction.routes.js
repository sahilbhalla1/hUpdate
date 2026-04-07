const express = require("express");
const router = express.Router();
const { fetchRepairActions } = require("./repairAction.controller");

router.get("/", fetchRepairActions);

module.exports = router;
