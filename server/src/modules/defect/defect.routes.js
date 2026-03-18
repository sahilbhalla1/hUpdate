const express = require("express");
const router = express.Router();
const { fetchDefects } = require("./defect.controller");

router.get("/", fetchDefects);

module.exports = router;
