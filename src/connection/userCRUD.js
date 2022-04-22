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
  isUnique,
  countUsers,
} = require('../common/data-helper');
const createApplication = require('express/lib/express');

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

const createUser = async (req, res) => {
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
  let invalidFields = [];
  for (let [property, value] of body) {
    if (!User[property]) {
      invalidFields.push(property);
    }
  }
  if (invalidFields.length > 0) {
    return res.status(404).send(`Invalid field: ${invalidFields}`);
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
      .send(`Invalid data. Fields: ${notUniqueFields} are not unique.`);
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
  //if there is annother return here -> problem!!
};

//PUT is a method of modifying resource where the client sends data that updates the entire resource
const updateUser = async (req, res) => {
  const id = parseInt(req.params.id);
  const body = Object.entries(req.body);

  //verify: mandatory fields
  for (let [property, value] of Object.entries(User)) {
    if (!req.body[property] && property !== 'id') {
      //desconsiders id bc u get it from req.params
      return res
        .status(404)
        .send(`Mandatory field (${property}) was not informed.`);
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
    return res.status(404).send(`Invalid field: ${invalidFields}`);
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
      .send(`Invalid data. Fields: ${notUniqueFields} are not unique.`);
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
const updateUserPartially = async (req, res) => {
  const id = parseInt(req.params.id);
  const body = Object.entries(req.body);

  //validate: req.body has the required fields of User and *only* those
  let invalidFields = [];
  for (let [property, value] of body) {
    if (!User[property]) {
      invalidFields.push(property);
    }
  }
  if (invalidFields.length > 0) {
    return res.status(404).send(`Invalid field: ${invalidFields}`); //imprime vetor bem?
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
      .send(`Invalid data. Fields: ${notUniqueFields} are not unique.`);
  }

  let rawQuery = auxUpdateUser(id, body);
  console.log(rawQuery);

  pool.query(rawQuery, (err, results) => {
    if (err) {
      let error = adjustError(err);
      return res.status(400).json(error);
    }
    console.log('resuls from updateUserPartially: ', results);
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
