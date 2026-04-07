const express = require("express");
const router = express.Router();
const { fetchOrderSources } = require("./orderSource.controller");

router.get("/", fetchOrderSources);

module.exports = router;
