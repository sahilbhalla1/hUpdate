const express = require("express");
const router = express.Router();
const { fetchOrderTypes } = require("./orderType.controller");

router.get("/", fetchOrderTypes);

module.exports = router;
