const { BadRequestError } = require("../expressError");

// THIS NEEDS SOME GREAT DOCUMENTATION.
/**Given dataToUpdate (object with data being used to update company/user) : {firstName: 'Aliya', age:32}
 * and jsToSql(object keys are Javascript notation of updated data and value is the sql notation): {firstName: first_name, age: age}
 *
 * converts keys of dataToUpdate object into a query string that can be plugged into a sql query
 * converts values into an array of values that can used as sql parameters
 *
 * return on object {setCols: '"first_name"=$1', '"age"=$2', values: ['Aliya', 32]}
 */

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  // throws an error if no keys are found in dataToUpdate
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map(
    (colName, idx) => `"${jsToSql[colName] || colName}"=$${idx + 1}`
  );

  return {
    // converts array of query string into one combined query string
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
};

/**Given dataToFliter (object with query being used to filter GET companies) : {name: 'Test', minEmployee:32, maxEmployees: 35}
 * and jsToSql(object keys are filter criteria and values represent sql query needed to make those filters): {ame: "handle LIKE ", minEmployees: "num_employees <= ",
maxEmployees: "max_employees >="}
 *
 * converts keys of dataToFilter object into a query string that can be plugged into a sql query
 * converts values into an array of values that can used as sql parameters
 *
 * return on object {setCols: 'name LIKE $1 AND num_employees <= $2 AND max_employees >=$3', values: ['%Aliya%', 32, 200]}
 * 
 * designed to work for filtering companies and filtering jobs
 */


function sqlForFilter(dataToFilter, jsToSql) {
  const keys = Object.keys(dataToFilter);
  const values = Object.values(dataToFilter);

  // {name: 'test', minEmployees: 32, maxEmployees: 200} => ['name LIKE $1', 'num_employees <= $2', 'max_employees >=$3']
  const cols = keys.map((colName, idx) => {
    // 'test' => '%test%' 
    // ['32', '35'] => [32, 35]
    // all string values are lowercased to produce case-insensitive queries
    if (jsToSql[colName] === "handle LIKE " || jsToSql[colName] === "title LIKE " ) values[idx] =`%${values[idx].toLowerCase()}%`;
    else values[idx] = Number(values[idx])
    return `${jsToSql[colName]}$${idx + 1}`
  });

  return {
    // converts array of query string into one combined query string
    setCols: cols.join(" AND "),
    values,
  };
}

module.exports = { sqlForPartialUpdate, sqlForFilter };
