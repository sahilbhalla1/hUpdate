const jwt = require('jsonwebtoken');
const env = require('../config/env');

/**
 * Sign access token
 */
function signAccess(user) {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
    },
    env.jwt.secret,
    {
      expiresIn: env.jwt.expiresIn,
    }
  );
}

/**
 * Verify access token
 */
function verifyAccess(token) {
  return jwt.verify(token, env.jwt.secret);
}

module.exports = {
  signAccess,
  verifyAccess,
};
