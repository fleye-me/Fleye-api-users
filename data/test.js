const client = require('./database');

//client.connect();

const query = async () => {
    await client.connect();

    client.query('select * from users', (err, result) => {
        if (!err) {
            console.log(result.rows);
        }
        client.end();
    });
};

query();
