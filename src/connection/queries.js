/*
    Setting up configuration of PostgreSql connection
*/

const { response } = require('express');

const Pool = require('pg').Pool;
const pool = new Pool({
  user: 'admin',
  host: 'localhost',
  database: 'apiusuarios',
  password: 'admin', //may be wrong
  port: 5432,
});

// creating endpoints

const getUsers = (req, res) => {
  pool.query('SELECT * FROM users ORDER BY id ASC', (err, results) => {
    if (err) throw err;
    res.status(200).json(results.rows); //200 means OK
  });
};

const getUserById = (req, res) => {
  const id = parseInt(req.params.id);

  pool.query('SELECT * FROM users WHERE id = $1', [id], (err, results) => {
    if (err) {
      throw error;
    }
    if (results.rows.length > 0) res.status(200).json(results.rows);
    else res.status(400).send('User not found.'); // 400 means bad request
  });
};

const createUser = (req, res) => {
  const { name, age } = req.body;

  pool.query(
    'INSERT INTO users (name, age) VALUES ($1, $2)',
    [name, age],
    (err, results) => {
      if (err) throw err;

      res.status(201).send('User added.'); // 201 means created ok
    }
  );
};

//allows to just update part of the user (thats supposed to be patch, not put)
const updateUser = (req, res) => {
  const id = parseInt(req.params.id);
  const { name, age } = req.body; //future problem: age not int

  if (name && age) {
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
  } else {
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
};

const deleteUser = (req, res) => {
  const id = parseInt(req.params.id);

  pool.query('DELETE FROM users WHERE id = $1', [id], (err, results) => {
    if (err) throw err;

    res.status(200).send(`User deleted with ID: ${id}`);
  });
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
