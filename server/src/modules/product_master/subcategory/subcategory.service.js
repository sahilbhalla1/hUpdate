const db = require("../../../config/db");

exports.create = async ({ category_id, name, code }) => {
  const [cat] = await db.execute(
    'SELECT status FROM categories WHERE id=?',
    [category_id]
  );
 
  if (!cat.length || cat[0].status !== 'ACTIVE') {
    throw new Error('Invalid parent category');
  }
 
  const [result] = await db.execute(
    `INSERT INTO sub_categories (category_id, name, code, status)
     VALUES (?, ?, ?, 'ACTIVE')`,
    [category_id, name, code]
  );
 
  return result.insertId;
};
 
// exports.update = async (id, data) => {
//   await db.execute(
//     `UPDATE sub_categories SET name=?, code=? WHERE id=?`,
//     [data.name, data.code, id]
//   );
// };
 
// exports.updateStatus = async (id, status) => {
//   await db.execute(
//     `UPDATE sub_categories SET status=? WHERE id=?`,
//     [status, id]
//   );
// };
 

exports.update = async (id, { name, code, status }) => {
  const fields = [];
  const values = [];

  if (name !== undefined) {
    fields.push("name = ?");
    values.push(name);
  }

  if (code !== undefined) {
    fields.push("code = ?");
    values.push(code);
  }

  if (status !== undefined) {
    fields.push("status = ?");
    values.push(status);
  }

  if (fields.length === 0) {
    throw new Error("No fields to update");
  }

  values.push(id);

  await db.execute(
    `UPDATE sub_categories SET ${fields.join(", ")} WHERE id = ?`,
    values
  );
};

exports.getAll = async (category_id) => {
  const [rows] = await db.execute(
    `SELECT * FROM sub_categories WHERE category_id=?`,
    [category_id]
  );
  return rows;
};