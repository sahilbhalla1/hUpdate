const db = require('../../../config/db');
 
exports.create = async ({ sub_category_id, spec_value }) => {
  const [sub] = await db.execute(
    'SELECT status FROM sub_categories WHERE id=?',
    [sub_category_id]
  );
 
  if (!sub.length || sub[0].status !== 'ACTIVE') {
    throw new Error('Invalid sub category');
  }
 
  const [result] = await db.execute(
    `INSERT INTO model_specifications 
     (sub_category_id, spec_value, status)
     VALUES (?, ?, 'ACTIVE')`,
    [sub_category_id, spec_value]
  );
 
  return result.insertId;
};
 

exports.update = async (id, data) => {
  const fields = [];
  const values = [];

  if (data.spec_value !== undefined) {
    fields.push("spec_value = ?");
    values.push(data.spec_value);
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
    `UPDATE model_specifications SET ${fields.join(", ")} WHERE id = ?`,
    values
  );
};
 
exports.getAll = async (sub_category_id) => {
  const [rows] = await db.execute(
    `SELECT * FROM model_specifications WHERE sub_category_id=?`,
    [sub_category_id]
  );
  return rows;
};