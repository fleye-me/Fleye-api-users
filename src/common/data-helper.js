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
  let fields = [];

  let values = [];
  for (let [property, value] of body) {
    fields.push(property);

    if (typeof value === 'string') {
      values.push(`'${value}'`);
      // rawQueryValues += "'" + value + "'";
    } else {
      values.push(value);
      // rawQueryValues += value;
    }

    // if (body.indexOf([property, value]) < body.length - 1) {
    //   rawQueryValues += ', ';
    //   fields += ', ';
    // } else {
    //   rawQueryValues += ') ';
    //   fields += ') ';
    // }
  }

  rawQuery += ` (${fields.join(', ')}) values (${values.join(', ')});`;
  // rawQuery += fields + 'values' + rawQueryValues + ';';
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

module.exports = { auxGet, auxCreateUser, auxUpdateUser };
