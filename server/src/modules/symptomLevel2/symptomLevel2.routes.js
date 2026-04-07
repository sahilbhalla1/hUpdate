const express = require("express");
const router = express.Router();
const { fetchSymptomLevel2 } = require("./symptomLevel2.controller");

router.get("/", fetchSymptomLevel2);

module.exports = router;
