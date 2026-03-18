const mysql = require('mysql2/promise');
const env = require('./env');

const pool = mysql.createPool({
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  database: env.db.name,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+00:00',
});

(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL connected:', env.db.name);
    connection.release();
  } catch (err) {
    console.error('❌ MySQL connection failed');
    console.error(err.message);
    process.exit(1);
  }
})();

module.exports = pool;
