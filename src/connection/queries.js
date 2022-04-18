/*
    Setting up configuration of PostgreSql connection
*/

const User = require('../schemas/user.schema');

const Pool = require('pg').Pool;
const pool = new Pool({
  user: 'admin',
  host: 'localhost',
  database: 'apiusuarios',
  password: 'admin',
  port: 5432,
});

const { initQuery, adjustError } = require('../common/query-helper');

const {
  auxGet,
  auxCreateUser,
  auxUpdateUser,
} = require('../common/data-helper');

// creating endpoints

const getUsers = (req, res) => {
  queryy = req.query;

  queryy = initQuery(queryy);
  let rawQuery = auxGet(queryy);

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
    if (results.rows.length > 0) {
      res.status(200).json(results.rows);
    } else {
      res.status(404).send('User not found.'); // 400 means bad request
    }
  });
};

const createUser = (req, res) => {
  const body = Object.entries(req.body);

  //checks mandatory fields of User
  for (let [property, value] of Object.entries(User)) {
    if (value.required || value.create?.required) {
      if (!req.body[property] && property !== 'id') {
        //desconsiders id bc it is automatically generated
        return res
          .status(404)
          .send(`Mandatory field (${property}) was not informed.`);
      }
    }
  }
  //checks if request fields are valid
  for (let [property, value] of body) {
    if (!User[property]) {
      return res.status(404).send(`Invalid field: ${property}`);
    }
  }

  rawQuery = auxCreateUser(body);
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

  for (let [property, value] of Object.entries(User)) {
    if (!req.body[property] && property !== 'id') {
      //NEW ALTERATIONS: for (const [key, value] of Object.entries(object)) {
      //desconsiders id bc u get it from req.params
      return res
        .status(404)
        .send(`Mandatory field (${property}) was not informed.`);
    }
  }
  //validate: req.body has the required fields of User and *only* those
  for (let [property, value] of body) {
    if (!User[property]) {
      return res.status(404).send(`Invalid field: ${property}`);
    }
  }

  // rawQuery += ' WHERE id = ' + id + ';';
  let rawQuery = auxUpdateUser(id, body);
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

    if (results.rowCount == 0) {
      return res.status(404).send('User not found.');
    }
    return res.status(200).send(`User deleted with ID: ${id}`);
  });
};

//PATCH is a method of modifying resources where the client sends partial data that
//is to be updated without modifying the entire data.
const updateUserPartially = (req, res) => {
  const id = parseInt(req.params.id);
  const body = Object.entries(req.body);

  //validate: req.body has the required fields of User and *only* those
  for (let [property, value] of body) {
    if (!User[property]) {
      return res.status(404).send(`Invalid field: ${property}`);
    }
  }

  let rawQuery = auxUpdateUser(id, body);
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
