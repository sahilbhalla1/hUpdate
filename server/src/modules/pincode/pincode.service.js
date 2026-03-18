const db = require("../../config/db");

async function getPincodeByCode(pincode) {
  const query = `
    SELECT 
      pincode,
      city,
      state,
      province_code,
      sla
    FROM pincodes
    WHERE pincode = ?
      AND status = 'ACTIVE'
    LIMIT 1
  `;

  const [rows] = await db.execute(query, [pincode]);

  return rows.length ? rows[0] : null;
}

module.exports = {
  getPincodeByCode
};
