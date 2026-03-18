const bcrypt = require('bcrypt');
const db = require('../../config/db');
const { signAccess } = require('../../utils/jwt');

exports.register = async ({ email, password, name, phone, role, status }) => {
  if (!email || !password) {
    throw new Error('Email and password required');
  }

  const [existing] = await db.query(
    'SELECT id FROM users WHERE email = ?',
    [email]
  );

  if (existing.length) {
    throw new Error('User already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const [result] = await db.query(
    `INSERT INTO users (email, password, name, phone, role, status)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [email, hashedPassword, name, phone, role, status || null]
  );

  return {
    id: result.insertId,
    email,
  };
};

exports.login = async ({ email, password }) => {
  if (!email || !password) {
    throw new Error('Email and password required');
  }

  const [rows] = await db.query(
    'SELECT * FROM users WHERE email = ?',
    [email]
  );

  if (!rows.length) {
    throw new Error('Invalid credentials');
  }

  const user = rows[0];

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  const accessToken = signAccess(user);

  return {
    accessToken,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    cookieOptions: {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/hisense-ts-api/',
      maxAge: 6 * 60 * 60 * 1000,
    },
  };
};

exports.dialerLogin = async ({ agentId }) => {
  if (!agentId) {
    throw new Error('agentId required');
  }

  // 🔥 Normalize agentId
  const normalizedEmail =
    agentId.toLowerCase().trim() + '@cogent.com';

  const [rows] = await db.query(
    'SELECT * FROM users WHERE LOWER(email) = ?',
    [normalizedEmail]
  );

  if (!rows.length) {
    throw new Error('Invalid credentials');
  }

  const user = rows[0];

  const accessToken = signAccess(user);

  return {
    accessToken,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    cookieOptions: {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/hisense-ts-api/',
      maxAge: 6 * 60 * 60 * 1000,
    },
  };
};
