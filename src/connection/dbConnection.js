//connection to Postgresql database

const Pool = require('pg').Pool;
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.PORT,
});

pool.connect(function (err) {
  if (err) throw err;
  console.log('Connected!!');
});
module.exports = pool;
