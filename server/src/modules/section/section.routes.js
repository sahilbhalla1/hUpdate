const express = require("express");
const router = express.Router();
const { fetchSections } = require("./section.controller");

router.get("/", fetchSections);

module.exports = router;
