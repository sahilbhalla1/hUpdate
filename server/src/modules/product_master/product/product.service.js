const db = require('../../../config/db');
 
exports.create = async ({ customer_model_id, product_code }) => {
  const [model] = await db.execute(
    'SELECT status FROM customer_models WHERE id=?',
    [customer_model_id]
  );
 
  if (!model.length || model[0].status !== 'ACTIVE') {
    throw new Error('Invalid model');
  }
 
  const [result] = await db.execute(
    `INSERT INTO product_ids 
     (customer_model_id, product_code, status)
     VALUES (?, ?, 'ACTIVE')`,
    [customer_model_id, product_code]
  );
 
  return result.insertId;
};
 
 
exports.update = async (id, data) => {
  const fields = [];
  const values = [];

  if (data.product_code !== undefined) {
    fields.push("product_code = ?");
    values.push(data.product_code);
  }

  if (data.status !== undefined) {
    fields.push("status = ?");
    values.push(data.status);
  }

  if (fields.length === 0) {
    throw new Error("No fields to update");
  }

  values.push(id);

  const query = `
    UPDATE product_ids 
    SET ${fields.join(", ")} 
    WHERE id = ?
  `;

  await db.execute(query, values);
};

exports.getAll = async (customer_model_id) => {
  const [rows] = await db.execute(
    `SELECT * FROM product_ids WHERE customer_model_id=?`,
    [customer_model_id]
  );
  return rows;
};