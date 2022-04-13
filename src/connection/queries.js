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
  const body = Object.entries(req.body);
  let rawQuery = 'INSERT INTO users';

  //checks mandatory fields of User
  for (let attribute of Object.entries(User)) {
    if (attribute[1].required || attribute[1].create?.required)
      if (!req.body[attribute[0]] && attribute[0] !== 'id')
        //desconsiders id bc it is automatically generated
        return res
          .status(404)
          .send(`Mandatory field (${attribute[0]}) was not informed.`);
  }

  let fields = ' (';
  rawQueryValues = ' (';
  for (let attribute of body) {
    //checks if request fields are valid
    if (!User[attribute[0]])
      return res.status(404).send(`Invalid field: ${attribute[0]}`);

    fields += attribute[0];

    if (typeof attribute[1] === 'string')
      rawQueryValues += "'" + attribute[1] + "'";
    else rawQueryValues += attribute[1];

    if (body.indexOf(attribute) < body.length - 1) {
      rawQueryValues += ', ';
      fields += ', ';
    } else {
      rawQueryValues += ') ';
      fields += ') ';
    }
  }

  rawQuery += fields + 'values' + rawQueryValues + ';';
  console.log(rawQuery);

  pool.query(rawQuery, (err, results) => {
    if (err) {
      let error = adjustError(err);
      return res.status(400).json(error);
    }
    return res.status(201).send('User created.'); // 201 means created ok
  });
};

//PUT is a method of modifying resource where the client sends data that updates the entire resource
const updateUser = (req, res) => {
  const id = parseInt(req.params.id);
  const body = Object.entries(req.body);
  let rawQuery = 'UPDATE users SET ';

  for (let attribute of Object.entries(User)) {
    if (!req.body[attribute[0]] && attribute[0] !== 'id')
      //desconsiders id bc u get it from req.params
      return res
        .status(404)
        .send(`Mandatory field (${attribute[0]}) was not informed.`);
  }
  //validate: req.body has the required fields of User and *only* those
  for (let attribute of body) {
    if (!User[attribute[0]])
      return res.status(404).send(`Invalid field: ${attribute[0]}`);

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

//PATCH is a method of modifying resources where the client sends partial data that
//is to be updated without modifying the entire data.
const updateUserPartially = (req, res) => {
  const id = parseInt(req.params.id);
  const body = Object.entries(req.body);
  let rawQuery = 'UPDATE users SET ';

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

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateUserPartially,
};
