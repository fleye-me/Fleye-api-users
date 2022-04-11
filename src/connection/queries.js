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
  const { name, age } = req.body;

  if (!name || !age) {
    return res.status(400).send('Obrigatory fields were null');
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
  const { name, age } = req.body; //future problem: age not int

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
  const { name, age } = req.body; //future problem: age not int

  if (name && age) {
    //prob can  improve this
    //updating name and age
    pool.query(
      'UPDATE users SET name = $1, age = $2 WHERE id = $3',
      [name, age, id],
      (err, results) => {
        if (err) throw err;

        res.status(200).send(`User modified with ID: ${id}`);
      }
    );
  } else if (name) {
    //updating just name (age remains the same)
    pool.query(
      'UPDATE users SET name = $1 WHERE id = $2',
      [name, id],
      (err, results) => {
        if (err) throw err;

        res.status(200).send(`User modified with ID: ${id}`);
      }
    );
  } else if (age) {
    //updating just age (name remains)
    pool.query(
      'UPDATE users SET age = $1 WHERE id = $2',
      [age, id],
      (err, results) => {
        if (err) throw err;

        res.status(200).send(`User modified with ID: ${id}`);
      }
    );
  }
  return res.status(400).send('Unable to update either name and age.');
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateUserPartially,
};
