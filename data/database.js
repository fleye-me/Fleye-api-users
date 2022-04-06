const { Client } = require('pg');

const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'admin',
    password: 'admin',
    database: 'apiusuarios',
});
client.connect();

client.query('Select * from users', (err, res) => {
    if (!err) {
        console.log(res.rows);
    } else {
        console.log(err.message);
    }
    client.end;
});

/*
client.on('connect', () => {
    console.log('Database connection');
});

client.on('end', () => {
    console.lof('Database end');
});

module.exports = client;
*/
