const User = require('../schema/user.schema');
require('dotenv').config();
const USER_ERRORS = require('../errors/error');

const pool = require('../connection/dbConnection');

const { initQuery, adjustError } = require('./users-query.service-helper');

const {
  buildSQLGetRawQuery,
  buildSQLCreateUserRawQuery,
  buildSQLUpdateUserRawQuery,
  isUnique,
  countUsers,
  validateUser,
} = require('./users-sql.service-helper');
const createApplication = require('express/lib/express');

const getUsers = (req, res) => {
  queryy = req.query;

  queryy = initQuery(queryy);
  let rawQuery = buildSQLGetRawQuery(queryy);

  pool.query(rawQuery, (err, results) => {
    if (err) {
      let error = adjustError(err);
      return res.status(400).json(error);
    }
    return res.status(200).json(results.rows);
  });
};

const getUserById = async (req, res) => {
  const id = parseInt(req.params.id);
  //validate: user existis
  try {
    if (!(await validateUser(id))) {
      return res.status(404).send(USER_ERRORS.NOT_FOUND);
    }
  } catch (e) {
    return res.status(400).json(e);
  }

  pool.query('SELECT * FROM users WHERE id = $1', [id], (err, results) => {
    if (err) {
      let error = adjustError(err);
      return res.status(400).json(error);
    }
    return res.status(200).json(results.rows);
  });
};

const createUser = async (req, res) => {
  const body = Object.entries(req.body);

  //checks mandatory fields of User
  for (let [property, value] of Object.entries(User)) {
    if (value.required || value.create?.required) {
      if (!req.body[property] && property !== 'id') {
        //desconsiders id bc it is automatically generated
        return res
          .status(404)
          .send(USER_ERRORS.MISSING_MANDATORY_FIELDS + property);
      }
    }
  }
  //checks if request fields are valid
  let invalidFields = [];
  for (let [property, value] of body) {
    if (!User[property]) {
      invalidFields.push(property);
    }
  }
  if (invalidFields.length > 0) {
    return res.status(404).send(USER_ERRORS.INVALID_FIELDS + invalidFields);
  }

  //validate: field that marked as unique is unique
  let notUniqueFields = [];
  for (let [property, value] of body) {
    if (User[property].unique) {
      try {
        let isUniques = await isUnique(property, value);
        if (!isUniques) {
          notUniqueFields.push(property);
        }
      } catch (e) {
        return res.status(400).json(e);
      }
    }
  }
  if (notUniqueFields.length > 0) {
    return res
      .status(400)
      .send(USER_ERRORS.DATA_IS_NOT_UNIQUE + notUniqueFields);
  }

  rawQuery = buildSQLCreateUserRawQuery(body);

  pool.query(rawQuery, (err, results) => {
    if (err) {
      let error = adjustError(err);
      return res.status(400).json(error);
    }
    return res.status(201).send('User created.'); // 201 means created ok
  });
  //if there is annother return here -> problem!!
};

//PUT is a method of modifying resource where the client sends data that updates the entire resource
const updateUser = async (req, res) => {
  const id = parseInt(req.params.id);
  const body = Object.entries(req.body);

  //validate: user existis
  try {
    if (!(await validateUser(id))) {
      return res.status(404).send(USER_ERRORS.NOT_FOUND);
    }
  } catch (e) {
    return res.status(400).json(e);
  }

  //verify: mandatory fields
  for (let [property, value] of Object.entries(User)) {
    if (!req.body[property] && property !== 'id') {
      //desconsiders id bc u get it from req.params
      return res
        .status(404)
        .send(USER_ERRORS.MISSING_MANDATORY_FIELDS + property);
    }
  }
  //validate: req.body has the required fields of User and *only* those
  let invalidFields = [];
  for (let [property, value] of body) {
    if (!User[property]) {
      invalidFields.push(property);
    }
  }
  if (invalidFields.length > 0) {
    return res.status(404).send(USER_ERRORS.INVALID_FIELDS + invalidFields);
  }

  //validate: field that marked as unique is unique
  let notUniqueFields = [];
  for (let [property, value] of body) {
    if (User[property].unique) {
      try {
        let isUniques = await isUnique(property, value);
        if (!isUniques) {
          notUniqueFields.push(property);
        }
      } catch (e) {
        return res.status(400).json(e);
      }
    }
  }
  if (notUniqueFields.length > 0) {
    return res
      .status(400)
      .send(USER_ERRORS.DATA_IS_NOT_UNIQUE + notUniqueFields);
  }

  let rawQuery = buildSQLUpdateUserRawQuery(id, body);

  pool.query(rawQuery, (err, results) => {
    if (err) {
      let error = adjustError(err);
      return res.status(400).json(error);
    }
    return res.status(200).send(`User modified with ID: ${id}`);
  });
};

const deleteUser = async (req, res) => {
  const id = parseInt(req.params.id);

  //validate: user existis
  try {
    if (!(await validateUser(id))) {
      return res.status(404).send(USER_ERRORS.NOT_FOUND);
    }
  } catch (e) {
    return res.status(400).json(e);
  }

  pool.query('DELETE FROM users WHERE id = $1', [id], (err, results) => {
    if (err) {
      let error = adjustError(err);
      return res.status(400).json(error);
    }
    return res.status(200).send(`User deleted with ID: ${id}`);
  });
};

//PATCH is a method of modifying resources where the client sends partial data that
//is to be updated without modifying the entire data.
const updateUserPartially = async (req, res) => {
  const id = parseInt(req.params.id);
  const body = Object.entries(req.body);

  //validate: user existis
  try {
    if (!(await validateUser(id))) {
      return res.status(404).send(USER_ERRORS.NOT_FOUND);
    }
  } catch (e) {
    return res.status(400).json(e);
  }

  //validate: req.body has the required fields of User and *only* those
  let invalidFields = [];
  for (let [property, value] of body) {
    if (!User[property]) {
      invalidFields.push(property);
    }
  }
  if (invalidFields.length > 0) {
    return res.status(404).send(USER_ERRORS.INVALID_FIELDS + invalidFields); //imprime vetor bem?
  }

  //validate: field that marked as unique is unique
  let notUniqueFields = [];
  for (let [property, value] of body) {
    if (User[property].unique) {
      try {
        let isUniques = await isUnique(property, value);
        if (!isUniques) {
          notUniqueFields.push(property);
        }
      } catch (e) {
        return res.status(400).json(e);
      }
    }
  }
  if (notUniqueFields.length > 0) {
    return res
      .status(400)
      .send(USER_ERRORS.DATA_IS_NOT_UNIQUE + notUniqueFields);
  }

  let rawQuery = buildSQLUpdateUserRawQuery(id, body);

  pool.query(rawQuery, (err, results) => {
    if (err) {
      let error = adjustError(err);
      return res.status(400).json(error);
    }
    return res.status(200).send(`User modified with ID: ${id}`);
  });
};

const countAllUsers = async (req, res) => {
  try {
    const count = await countUsers();
    return res.status(200).send(`Total = ${count}`);
  } catch (e) {
    return res.status(400).json(e);
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateUserPartially,
  countAllUsers,
};
