const express = require("express");
const router = express.Router();
const { fetchSymptomLevel1 } = require("./symptomLevel1.controller");

router.get("/", fetchSymptomLevel1);

module.exports = router;
