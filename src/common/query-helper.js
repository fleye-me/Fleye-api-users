/*
    This function recieves a request object and initializes common variables
    Common variables: limit, page, sort, skip, filter
    How to access this variables from other files: common.<varible>
*/
function initQuery(query, defaultValues) {
    let limit, page, sort, skip, filter;

    limit = parseInt(query['limit']);
    if (Number.isNaN(limit)) limit = defaultValues.limit || 20; //either a default value for limit is informed (parameter) or it's 20

    page = parseInt(query['page']);
    if (Number.isNaN(page)) page = defaultValues.page || 0;

    sort = query['sort'];
    if (sort == null) sort = defaultValues.sort || 'DESC';

    skip = parseInt(query['skip']);
    if (Number.isNaN(skip)) skip = defaultValues.skip || 0;

    filter = query['filter'];

    return {
        limit,
        page,
        sort,
        skip,
        filter,
    };
}

function organizeData(query, data) {
    return query.sort === 'DESC' ? Array.from(data).reverse() : data; //if sort is descendent return reverse data
    // Array.from(data) is necessary to create a copy of the object
    // bc otherwise u are altering the original object, and it messes with next requests
}

function executeFilters(query, data) {
    const { skip, limit, page, filter } = query; //decompose query object, if the object doesn't have one of the variables ERROR
    let output = data;
    if (filter) {
        output = [];
        filterJson = JSON.parse(filter);
        let filterValues = Object.entries(filterJson);
        for (let item of data) {
            let isItemOK = filterValues.reduce((approved, filterInstance) => {
                //for each filter in list [key, value] of filter apply:
                return (
                    approved && item[filterInstance[0]] === filterInstance[1]
                );
            }, true); //initial value is true (bc logical operation is AND)

            if (isItemOK) {
                output.push(item);
            }
        }
    }

    if (skip) output = output.slice(skip);

    let beginning = limit * page;
    let end = limit * page + limit;

    return output.slice(beginning, end);
}

module.exports = { initQuery, organizeData, executeFilters }; //end of file, exports functions
