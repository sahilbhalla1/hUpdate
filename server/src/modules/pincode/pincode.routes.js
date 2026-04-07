const express = require('express');
const router = express.Router();


const multer = require("multer");
const XLSX = require("xlsx");
const pool = require('../../config/db');

const pincodeController = require('./pincode.controller');

router.get('/:pincode', pincodeController.fetchPincode);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

const ALLOWED_SLA = ["D+0", "D+1", "D+2", "D+3", "TBD"];

router.post("/upload", upload.single("file"), async (req, res) => {
  let connection;
// console.log("gfd");

  try {
    if (!req.file) {
      return res.status(400).json({ message: "XLSX file required" });
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    if (!rows.length) {
      return res.status(400).json({ message: "Empty file" });
    }

    const values = [];
    console.log(rows[0]);
    for (const row of rows) {
    
      const pincode = row["Pincode"];
      const city = row["City"];
      const state = row["State"];
      const provinceRaw = row["Province"];
      const slaRaw = row["SLA"];

      if (!pincode || !city || !state || provinceRaw == null) continue;

      const province = provinceRaw.toString().padStart(2, "0");
      const sla = ALLOWED_SLA.includes(slaRaw) ? slaRaw : "TBD";

      values.push([
        String(pincode),
        city.trim(),
        state.trim(),
        province,
        sla,
        "ACTIVE",
      ]);
    }

    if (!values.length) {
      return res.status(400).json({ message: "No valid rows found" });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    const query = `
      INSERT INTO pincodes
      (pincode, city, state, province_code, sla, status)
      VALUES ?
      ON DUPLICATE KEY UPDATE
        city = VALUES(city),
        state = VALUES(state),
        province_code = VALUES(province_code),
        sla = VALUES(sla),
        status = VALUES(status)
    `;

    await connection.query(query, [values]);
    await connection.commit();

    res.json({
      message: "Upload successful",
      processedRows: values.length,
    });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error(error);
    res.status(500).json({ message: "Server error" });
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;
