"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  const newJob = {
    title: "test",
    salary: 100,
    equity: 0.1,
    companyHandle: "c1",
  };

  test("works", async function () {
    let job = await Job.create(newJob);
    expect(job).toEqual({
      id: job.id,
      title: job.title,
      salary: job.salary,
      equity: String(job.equity),
      companyHandle: job.companyHandle,
    });

    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle AS "companyHandle"
           FROM jobs
           WHERE id = ${job.id}`
    );
    expect(result.rows).toEqual([
      {
        id: expect.any(Number),
        title: "test",
        salary: 100,
        equity: "0.1",
        companyHandle: "c1",
      },
    ]);
  });

  test("bad request with dupe", async function () {
    try {
      await Job.create(newJob);
      await Job.create(newJob);
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

// /************************************** findAll */

describe("findAll", function () {
  test("works: no filter", async function () {
    let jobs = await Job.findAll();
    expect(jobs).toEqual([
      {
        id: expect.any(Number),
        title: "j1",
        salary: 1000,
        equity: "0.5",
        companyHandle: "c1",
      },
      {
        id: expect.any(Number),
        title: "j2",
        salary: 2000,
        equity: "0.25",
        companyHandle: "c2",
      },
      {
        id: expect.any(Number),
        title: "j3",
        salary: 3000, 
        equity: "0",
        companyHandle: 'c3'
    },
    ]);
  });
});

  describe("filterAll", function(){
    test("using filter {hasEquity: false}", async function () {
        const data = {
            hasEquity: "false"
        }
        const resp = await Job.findWithFilter(data);
        expect(resp).toEqual(
              [
                {
                    id: expect.any(Number),
                    title: "j1",
                    salary: 1000, 
                    equity: "0.5",
                    companyHandle: "c1", 
                },
                {
                    id: expect.any(Number),
                    title: "j2",
                    salary: 2000, 
                    equity: "0.25",
                    companyHandle: 'c2'
                },
                {
                    id: expect.any(Number),
                    title: "j3",
                    salary: 3000, 
                    equity: "0",
                    companyHandle: 'c3'
                },
              ],
        );
      });

    test("using filter {hasEquity: true}", async function () {
        const data = {
            hasEquity: "true"
        }
        const resp = await Job.findWithFilter(data);
        expect(resp).toEqual(
              [
                {
                    id: expect.any(Number),
                    title: "j1",
                    salary: 1000, 
                    equity: "0.5",
                    companyHandle: "c1", 
                },
                {
                    id: expect.any(Number),
                    title: "j2",
                    salary: 2000, 
                    equity: "0.25",
                    companyHandle: 'c2'
                },
              ],
        );
      });

    test("using filter {minSalary: 2000}", async function () {
        const data = {
            minSalary: "2000"
        }
        const resp = await Job.findWithFilter(data);
        expect(resp).toEqual(
              [
                {
                    id: expect.any(Number),
                    title: "j2",
                    salary: 2000, 
                    equity: "0.25",
                    companyHandle: 'c2'
                },
                {
                    id: expect.any(Number),
                    title: "j3",
                    salary: 3000, 
                    equity: "0",
                    companyHandle: 'c3'
                },
              ],
        );
      });

    test("using filter {minSalary: 2000, hasEquity: false}", async function () {
        const data = {
            minSalary: "2000",
            hasEquity: "false"
        }
        const resp = await Job.findWithFilter(data);
        expect(resp).toEqual(
              [
                {
                    id: expect.any(Number),
                    title: "j2",
                    salary: 2000, 
                    equity: "0.25",
                    companyHandle: 'c2'
                },
                {
                    id: expect.any(Number),
                    title: "j3",
                    salary: 3000, 
                    equity: "0",
                    companyHandle: 'c3'
                },
              ],
        );
      });

    test("using filter {minSalary: 2000, hasEquity: true}", async function () {
        const data = {
            minSalary: "2000",
            hasEquity: "true"
        }
        const resp = await Job.findWithFilter(data);
        expect(resp).toEqual(
              [
                {
                    id: expect.any(Number),
                    title: "j2",
                    salary: 2000, 
                    equity: "0.25",
                    companyHandle: 'c2'
                }
              ],
        );
      });

    test("using filter {title: 3}", async function () {
        const data = {
            title: "3"
        }
        const resp = await Job.findWithFilter(data);
        expect(resp).toEqual(
              [
                {
                    id: expect.any(Number),
                    title: "j3",
                    salary: 3000, 
                    equity: "0",
                    companyHandle: 'c3'
                }
              ],
        );
      });
  });


// /************************************** get */

describe("get", function () {
  test("works", async function () {
    const res =
      await db.query(`SELECT id, title, salary, equity, company_handle AS "companyHandle"
                                    FROM jobs
                                    WHERE company_handle = 'c1'`);

    const c1 = res.rows[0];
    let job = await Job.get(c1.id);
    expect(job).toEqual({
      id: c1.id,
      title: c1.title,
      salary: c1.salary,
      equity: String(c1.equity),
      companyHandle: c1.companyHandle,
    });
  });

  test("not found if no such job", async function () {
    try {
      await Job.get(0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

// /************************************** update */

describe("update", function () {
  const updateData = {
    title: "New",
    salary: 1,
    equity: 0,
  };

  let c1Id;

  test("works", async function () {
    const res =
      await db.query(`SELECT id, title, salary, equity, company_handle AS "companyHandle" 
  FROM jobs
  WHERE company_handle = 'c1'`);

    const c1 = res.rows[0];
    c1Id = c1.id;

    let job = await Job.update(c1.id, updateData);
    expect(job).toEqual({
      id: c1.id,
      title: updateData.title,
      salary: updateData.salary,
      equity: String(updateData.equity),
      companyHandle: c1.companyHandle,
    });

    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle AS "companyHandle" 
            FROM jobs
            WHERE id = ${c1.id}`
    );
    expect(result.rows).toEqual([
      {
        id: c1.id,
        title: "New",
        salary: 1,
        equity: "0",
        companyHandle: c1.companyHandle,
      },
    ]);
  });

  test("works: null fields", async function () {
    const updateDataSetNulls = {
      title: "New",
      salary: null,
      equity: null,
    };

    const res =
      await db.query(`SELECT id, title, salary, equity, company_handle AS "companyHandle" 
  FROM jobs
  WHERE company_handle = 'c1'`);

    const c1 = res.rows[0];

    let job = await Job.update(c1.id, updateDataSetNulls);
    expect([job]).toEqual([
      {
        id: c1.id,
        title: "New",
        salary: null,
        equity: null,
        companyHandle: c1.companyHandle,
      },
    ]);

    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle AS "companyHandle" 
          FROM jobs
          WHERE id = $1`,
      [c1.id]
    );
    expect(result.rows).toEqual([
      {
        id: c1.id,
        title: "New",
        salary: null,
        equity: null,
        companyHandle: c1.companyHandle,
      },
    ]);
  });

  test("not found if no such job", async function () {
    try {
      await Job.update(0, updateData);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await Job.update(c1Id, {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

// /************************************** remove */

describe("remove", function () {
  test("works", async function () {
    const result =
      await db.query(`SELECT id, title, salary, equity, company_handle AS "companyHandle" 
    FROM jobs
    WHERE company_handle = 'c1'`);

    const c1 = result.rows[0];
    const c1Id = c1.id;

    await Job.remove(c1Id);
    const res = await db.query(`SELECT id FROM jobs WHERE id=${c1Id}`);
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such job", async function () {
    try {
      await Job.remove(0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
