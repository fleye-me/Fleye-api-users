const { query } = require('express');
const { adjustError } = require('./query-helper');

const Pool = require('pg').Pool;
const pool = new Pool({
  user: 'admin',
  host: 'localhost',
  database: 'apiusuarios',
  password: 'admin',
  port: 5432,
});

// auxiliary functions - SQL commands
function auxGet(query) {
  const { skip, limit, page, filter, sort } = query; //decompose query object, if the object doesn't have one of the variables ERROR
  let rawQuery = 'SELECT * FROM users';

  if (filter != null) {
    filterJson = JSON.parse(filter);
    rawQuery += ' WHERE ';
    filters = Object.entries(filterJson);
    filters.forEach((element) => {
      if (typeof element[1] === 'string') {
        //when the column value is a strign needs ''
        rawQuery += `${element[0]} = '${element[1]}'`;
      } else {
        rawQuery += `${element[0]} = ${element[1]}`;
      }
      if (filters.indexOf(element) < filters.length - 1) {
        rawQuery += ' and ';
      }
    });
  }
  rawQuery += ` ORDER BY id ${sort}`;
  rawQuery += ` LIMIT ${limit}`;
  rawQuery += ` OFFSET ${page * limit + skip}`;

  rawQuery += ';';
  return rawQuery;
}

function auxCreateUser(body) {
  let rawQuery = 'INSERT INTO users';
  let fields = [];

  let values = [];
  for (let [property, value] of body) {
    fields.push(property);

    if (typeof value === 'string') {
      values.push(`'${value}'`);
    } else {
      values.push(value);
    }
  }

  rawQuery += ` (${fields.join(', ')}) values (${values.join(', ')});`;
  return rawQuery;
}

function auxUpdateUser(id, body) {
  let rawQuery = 'UPDATE users SET ';
  let values = [];
  for (let [property, value] of body) {
    if (typeof value === 'string') {
      values.push(`${property}  = '${value}'`);
    } else {
      values.push(`${property}  =  ${value}`);
    }
  }

  rawQuery += `${values.join(', ')} WHERE id = ${id};`;
  return rawQuery;
}

async function isUnique(propertyName, value) {
  let rawQuery;
  if (typeof value === 'string') {
    //assumes that the value informed is in the correct type
    rawQuery = `SELECT * FROM users WHERE ${propertyName} = '${value}';`;
  } else {
    rawQuery = `SELECT * FROM users WHERE ${propertyName} = ${value};`;
  }
  console.log('raw query from isUnique: ', rawQuery);
  const prom = await new Promise((resolve, reject) => {
    pool.query(rawQuery, (err, results) => {
      if (err) {
        let error = adjustError(err);
        reject(error);
      }
      resolve(results.rows.length === 0);
    });
  });
  console.log(prom);
  return prom;
}

async function countUsers(teste) {
  let rawQuery = 'SELECT count(*) FROM users;';
  const prom = new Promise((resolve, reject) => {
    try {
      pool.query(rawQuery, (err, results) => {
        resolve(results.rows[0]['count']);
      });
    } catch (e) {
      reject(e);
    }
  });
  return prom;
}

module.exports = {
  auxGet,
  auxCreateUser,
  auxUpdateUser,
  countUsers,
  isUnique,
};
