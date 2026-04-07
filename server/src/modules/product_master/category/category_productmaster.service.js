const db = require("../../../config/db");
 


exports.create = async ({ name, code }) => {
  const [exists] = await db.execute(
    'SELECT id FROM categories WHERE name = ?',
    [name]
  );

  if (exists.length) throw new Error('Category already exists');

  const [result] = await db.execute(
    `INSERT INTO categories (name, code)
     VALUES (?, ?)`,
    [name, code]
  );

  return result.insertId;
};
 

exports.update = async (id, { name, code, status }) => {
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    // Dynamic fields
    const fields = [];
    const values = [];

    if (name !== undefined) {
      fields.push("name=?");
      values.push(name);
    }

    if (code !== undefined) {
      fields.push("code=?");
      values.push(code);
    }

    if (status !== undefined) {
      fields.push("status=?");
      values.push(status);
    }

    if (!fields.length) {
      throw new Error("Nothing to update");
    }

    values.push(id);

    // Update category
    const [result] = await conn.execute(
      `UPDATE categories SET ${fields.join(", ")} WHERE id=?`,
      values
    );

    if (result.affectedRows === 0) {
      throw new Error("Category not found");
    }

    // Cascade only when INACTIVE
    if (status === 'INACTIVE') {

      await conn.execute(
        `UPDATE sub_categories SET status='INACTIVE' WHERE category_id=?`,
        [id]
      );

      await conn.execute(`
        UPDATE model_specifications SET status='INACTIVE'
        WHERE sub_category_id IN (
          SELECT id FROM sub_categories WHERE category_id=?
        )`, [id]);

      await conn.execute(`
        UPDATE customer_models SET status='INACTIVE'
        WHERE model_spec_id IN (
          SELECT id FROM model_specifications WHERE sub_category_id IN (
            SELECT id FROM sub_categories WHERE category_id=?
          )
        )`, [id]);

      await conn.execute(`
        UPDATE product_ids SET status='INACTIVE'
        WHERE customer_model_id IN (
          SELECT id FROM customer_models WHERE model_spec_id IN (
            SELECT id FROM model_specifications WHERE sub_category_id IN (
              SELECT id FROM sub_categories WHERE category_id=?
            )
          )
        )`, [id]);
    }

    await conn.commit();

  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
};

exports.getAll = async () => {
  const [rows] = await db.execute(`SELECT * FROM categories`);
  return rows;
};