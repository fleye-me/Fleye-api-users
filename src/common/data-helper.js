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
        rawQuery += element[0] + " = '" + element[1] + "'";
      } else {
        rawQuery += element[0] + ' = ' + element[1];
      }
      if (filters.indexOf(element) < filters.length - 1) {
        rawQuery += ' and ';
      }
    });
  }
  rawQuery += ' ORDER BY ' + 'id ' + sort;
  rawQuery += ' LIMIT ' + limit;
  rawQuery += ' OFFSET ' + (page * limit + skip);

  rawQuery += ';';
  return rawQuery;
}

function auxCreateUser(body) {
  let rawQuery = 'INSERT INTO users';
  let fields = ' (';
  let rawQueryValues = ' (';

  for (let attribute of body) {
    fields += attribute[0];

    if (typeof attribute[1] === 'string') {
      rawQueryValues += "'" + attribute[1] + "'";
    } else {
      rawQueryValues += attribute[1];
    }

    if (body.indexOf(attribute) < body.length - 1) {
      rawQueryValues += ', ';
      fields += ', ';
    } else {
      rawQueryValues += ') ';
      fields += ') ';
    }
  }
  rawQuery += fields + 'values' + rawQueryValues + ';';
  return rawQuery;
}

function auxUpdateUser() {
  let rawQuery = 'UPDATE users SET ';

  for (let attribute of body) {
    if (typeof attribute[1] === 'string') {
      rawQuery += attribute[0] + " = '" + attribute[1] + "'";
    } else {
      rawQuery += attribute[0] + ' = ' + attribute[1];
    }
    if (body.indexOf(attribute) < body.length - 1) {
      rawQuery += ', ';
    }
  }
}

module.exports = { auxGet, auxCreateUser };
