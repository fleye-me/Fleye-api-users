const { Client } = require('pg');

const client = new Client({
  user: 'admin',
  host: 'localhost',
  database: 'apiusuarios',
  password: 'admin',
  port: 5432,
});

client.connect(function (err) {
  if (err) throw err;
  console.log('Connected!');
});

module.exports = client;
