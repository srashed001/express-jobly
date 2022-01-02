const { sqlForPartialUpdate, sqlForFilter } = require("./sql");
const { BadRequestError } = require("../expressError");

describe("sqlForPartialUpdate", function () {
  test("works: provided data", function () {
    const dataToUpdate = { firstName: "Aliya", age: 32 };
    const jsToSql = { firstName: "first_name", age: "age" };
    const result = sqlForPartialUpdate(dataToUpdate, jsToSql);

    expect(result).toEqual({
      setCols: '"first_name"=$1, "age"=$2',
      values: ["Aliya", 32],
    });
  });

  test("BadRequestError: provided no data", function () {
    try {
      const dataToUpdate = {};
      const jsToSql = {};
      sqlForPartialUpdate(dataToUpdate, jsToSql);
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

describe("sqlForPartialUpdate", function () {
  test("works: provided company data", function () {
    const dataToUpdate = { name: "test", minEmployees: 3, maxEmployees: 4 };
    const jsToSql = {
      name: "handle LIKE ",
      minEmployees: "num_employees >= ",
      maxEmployees: "num_employees <= ",
    };
    const result = sqlForFilter(dataToUpdate, jsToSql);

    expect(result).toEqual({
      setCols: "handle LIKE $1 AND num_employees >= $2 AND num_employees <= $3",
      values: ["%test%", 3, 4],
    });
  });

  test("works: provided job data", function () {
    const dataToUpdate = { title: "test", minSalary: 300, hasEquity: 0 };
    const jsToSql = {
      title: "title LIKE ",
      minSalary: "salary >= ",
      hasEquity: "equity > ",
    };
    const result = sqlForFilter(dataToUpdate, jsToSql);

    expect(result).toEqual({
      setCols: "title LIKE $1 AND salary >= $2 AND equity > $3",
      values: ["%test%", 300, 0],
    });
});

  test("BadRequestError: minEmployees > maxEmployees", function () {
    try {
      const dataToUpdate = { minEmployees: 6, maxEmployees: 4 };
      const jsToSql = {
        name: "name LIKE ",
        minEmployees: "num_employees >= ",
        maxEmployees: "num_employees <= ",
      };
      sqlForFilter(dataToUpdate, jsToSql);
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});
