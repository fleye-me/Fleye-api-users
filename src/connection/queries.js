/*
    Setting up configuration of PostgreSql connection
*/

const { query } = require('express');
const { response } = require('express');
const { user, query_timeout } = require('pg/lib/defaults');

const Pool = require('pg').Pool;
const pool = new Pool({
  user: 'admin',
  host: 'localhost',
  database: 'apiusuarios',
  password: 'admin', //may be wrong
  port: 5432,
});

const {
  initQuery,
  adjustQuery,
  adjustError,
} = require('../common/query-helper');
const User = require('../schemas/user.schema');

// creating endpoints

const getUsers = (req, res) => {
  queryy = req.query;

  queryy = initQuery(queryy);
  let rawQuery = adjustQuery(queryy);

  console.log(rawQuery);

  pool.query(rawQuery, (err, results) => {
    if (err) {
      let error = adjustError(err);
      return res.status(400).json(error);
    }
    return res.status(200).json(results.rows);
  });
};

const getUserById = (req, res) => {
  const id = parseInt(req.params.id);

  pool.query('SELECT * FROM users WHERE id = $1', [id], (err, results) => {
    if (err) {
      let error = adjustError(err);
      return res.status(400).json(error);
    }
    if (results.rows.length > 0) res.status(200).json(results.rows);
    else res.status(404).send('User not found.'); // 400 means bad request
  });
};

const createUser = (req, res) => {
  const { name, age } = req.body; //what if there is more stuff in the body -> no message, but just creates a user

  if (!name || !age) {
    return res.status(404).send('Obrigatory fields were null');
  }

  pool.query(
    'INSERT INTO users (name, age) VALUES ($1, $2)',
    [name, age],
    (err, results) => {
      if (err) {
        let error = adjustError(err);
        return res.status(400).json(error);
      }

      return res.status(201).send('User added.'); // 201 means created ok
    }
  );
};

const updateUser = (req, res) => {
  const id = parseInt(req.params.id);
  const { name, age } = req.body; //what if there is more stuff in the body -> no message, but just updates the selected fields

  if (!name || !age) return res.status(404).send('Obrigatory fields were null');

  //updating name and age
  pool.query(
    'UPDATE users SET name = $1, age = $2 WHERE id = $3',
    [name, age, id],
    (err, results) => {
      if (err) {
        let error = adjustError(err);
        return res.status(400).json(error);
      }
      if (results.rowCount == 0) return res.status(404).send('User not found.');

      return res.status(200).send(`User modified with ID: ${id}`);
    }
  );
};

const deleteUser = (req, res) => {
  const id = parseInt(req.params.id);

  pool.query('DELETE FROM users WHERE id = $1', [id], (err, results) => {
    if (err) {
      let error = adjustError(err);
      return res.status(400).json(error);
    }

    if (results.rowCount == 0) return res.status(404).send('User not found.');

    return res.status(200).send(`User deleted with ID: ${id}`);
  });
};

const updateUserPartially = (req, res) => {
  const id = parseInt(req.params.id);
  const { name, age } = req.body; //in case a "new" fields is informed, no error message is presented

  if (!name || !age) return res.status(404).send('Obrigatory fields were null');

  rawQuery = 'UPDATE users SET ';
  if (name) rawQuery += "name = '" + name + "' ";
  if (name && age) rawQuery += ', ';
  if (age) rawQuery += 'age = ' + age;
  rawQuery += ' WHERE id = ' + id + ';';

  console.log(rawQuery);

  pool.query(rawQuery, (err, results) => {
    if (err) {
      let error = adjustError(err);
      return res.status(400).json(error);
    }
    return res.status(200).send(`User modified with ID: ${id}`);
  });
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateUserPartially,
};
