/*
    Setting up configuration of PostgreSql connection
*/

const { query } = require('express');
const { response } = require('express');
const { user, query_timeout } = require('pg/lib/defaults');
const User = require('../schemas/user.schema');

const Pool = require('pg').Pool;
const pool = new Pool({
  user: 'admin',
  host: 'localhost',
  database: 'apiusuarios',
  password: 'admin',
  port: 5432,
});

const {
  initQuery,
  adjustQuery,
  adjustError,
} = require('../common/query-helper');
const { attachment } = require('express/lib/response');

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

// put is mandatory to pass all user fields to update
const updateUser = (req, res) => {
  const id = parseInt(req.params.id);
  const body = Object.entries(req.body);
  let rawQuery = 'UPDATE users SET ';

  for (let attribute of Object.entries(User)) {
    if (attribute[1].required || attribute[1].create?.required) {
      //considers only the required attributes, in this casse is not usefull (needs all attributes)A
      //keeping the code for future reference
    }
    console.log(attribute[0]);
    console.log('>>', req.body[attribute[0]]);
    if (!req.body[attribute[0]] && attribute[0] !== 'id') {
      //desconsiders id bc u get it from req.params
      return res
        .status(404)
        .send(`Mandatory field (${attribute[0]}) was not informed.`);
    }
  }
  //validate: req.body has the required fields of User and *only* those
  for (let attribute of body) {
    if (!User[attribute[0]]) {
      return res.status(404).send(`Invalid field: ${attribute[0]}`);
    }

    if (typeof attribute[1] === 'string')
      rawQuery += attribute[0] + " = '" + attribute[1] + "'";
    else rawQuery += attribute[0] + ' = ' + attribute[1];
    if (body.indexOf(attribute) < body.length - 1) rawQuery += ', ';
  }

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
  const body = Object.entries(req.body);
  let rawQuery = 'UPDATE users SET ';

  //validate: req.body has the required fields of User and *only* those
  for (let attribute of body) {
    if (!User[attribute[0]]) {
      return res.status(404).send(`Invalid field: ${attribute[0]}`);
    }
    //update has no required field so ok, its expected to not enter this if
    if (User[attribute[0]].update?.required || User[attribute[0]].required) {
      //doesnt make sense, u are getting the required ones that u already have on the req.body
    }

    if (typeof attribute[1] === 'string')
      rawQuery += attribute[0] + " = '" + attribute[1] + "'";
    else rawQuery += attribute[0] + ' = ' + attribute[1];
    if (body.indexOf(attribute) < body.length - 1) rawQuery += ', ';
  }

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
