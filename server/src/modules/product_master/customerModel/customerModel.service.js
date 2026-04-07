const db = require('../../../config/db');
 
exports.create = async ({ model_spec_id, model_number }) => {
  const [spec] = await db.execute(
    'SELECT status FROM model_specifications WHERE id=?',
    [model_spec_id]
  );
 
  if (!spec.length || spec[0].status !== 'ACTIVE') {
    throw new Error('Invalid spec');
  }
 
  const [result] = await db.execute(
    `INSERT INTO customer_models 
     (model_spec_id, model_number, status)
     VALUES (?, ?, 'ACTIVE')`,
    [model_spec_id, model_number]
  );
 
  return result.insertId;
};
 


exports.update = async (id, data) => {
  const fields = [];
  const values = [];

  if (data.model_number !== undefined) {
    fields.push("model_number = ?");
    values.push(data.model_number);
  }

  if (data.status !== undefined) {
    fields.push("status = ?");
    values.push(data.status);
  }

  if (fields.length === 0) {
    throw new Error("No fields to update");
  }

  values.push(id);

  await db.execute(
    `UPDATE customer_models SET ${fields.join(", ")} WHERE id = ?`,
    values
  );
};
 
exports.getAll = async (model_spec_id) => {
  const [rows] = await db.execute(
    `SELECT * FROM customer_models WHERE model_spec_id=?`,
    [model_spec_id]
  );
  return rows;
};