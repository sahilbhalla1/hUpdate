const bcrypt = require('bcrypt');
const db = require('../../config/db');

exports.list = async () => {
  const [rows] = await db.query(
    `SELECT id, name,phone, email, role, status, created_at, updated_at
     FROM users
     ORDER BY created_at DESC`
  );
  return rows;
};

exports.getById = async (id) => {
  const [rows] = await db.query(
    `SELECT id, name,phone, email, role, status, created_at
     FROM users
     WHERE id = ?`,
    [id]
  );

  if (!rows.length) {
    throw new Error('User not found');
  }

  return rows[0];
};

exports.update = async (id, { name, phone, email, password, role, status }) => {
  if (!name || !email) {
    throw new Error('Name and email are required');
  }

  let query = `
    UPDATE users
    SET name = ?,phone=?, email = ?, role = ?, status = ?
  `;
  const params = [name, phone, email, role, status];

  if (password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    query += ', password = ?';
    params.push(hashedPassword);
  }

  query += ' WHERE id = ?';
  params.push(id);

  try {
    const [result] = await db.query(query, params);

    if (result.affectedRows === 0) {
      throw new Error('User not found');
    }

    const [rows] = await db.query(
      `SELECT id, name,phone, email, role, status, created_at, updated_at
       FROM users
       WHERE id = ?`,
      [id]
    );

    return rows[0];
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      throw new Error('Email already exists');
    }
    throw err;
  }
};

exports.remove = async (id) => {
  const [result] = await db.query(
    'DELETE FROM users WHERE id = ?',
    [id]
  );

  if (result.affectedRows === 0) {
    throw new Error('User not found');
  }
};
