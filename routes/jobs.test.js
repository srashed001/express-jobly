"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");
// u1Token => isAdmin: false  adminToken => isAdmin: true
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  adminToken,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */

describe("POST /jobs", function () {
  const newJob = {
    title: "new",
    salary: 1000,
    equity: 0.1,
    companyHandle: "c1",
  };

  test("ok for admin", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send(newJob)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      job: {
        id: expect.any(Number),
        title: "new",
        salary: 1000,
        equity: "0.1",
        companyHandle: "c1",
      },
    });
  });

  test("unauthorized request for users", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send(newJob)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send({
        title: "new",
        salary: 1000,
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data salary < 0", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send({
        title: "new",
        salary: -14,
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data equity > 1", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send({
        title: "new",
        equity: 2,
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /jobs */

describe("GET /jobs", function () {
    test("works no filter", async function () {
      const resp = await request(app).get("/jobs");
      expect(resp.body).toEqual({
        jobs:
            [
              {
                  id: expect.any(Number),
                  title: "j1",
                  salary: 1000, 
                  equity: "0.1",
                  companyHandle: "c1", 
              },
              {
                  id: expect.any(Number),
                  title: "j2",
                  salary: 2000, 
                  equity: "0.2",
                  companyHandle: 'c1'
              },
              {
                  id: expect.any(Number),
                  title: "j3",
                  salary: 3000, 
                  equity: "0.3",
                  companyHandle: 'c3'
              },
              {
                  id: expect.any(Number),
                  title: "j4",
                  salary: 4000, 
                  equity: "0",
                  companyHandle: 'c3'
              }
            ],
      });
    });

    test("using filter {hasEquity: false}", async function () {
      const resp = await request(app).get("/jobs?hasEquity=false");
      expect(resp.body).toEqual({
        jobs:
            [
              {
                  id: expect.any(Number),
                  title: "j1",
                  salary: 1000, 
                  equity: "0.1",
                  companyHandle: "c1", 
              },
              {
                  id: expect.any(Number),
                  title: "j2",
                  salary: 2000, 
                  equity: "0.2",
                  companyHandle: 'c1'
              },
              {
                  id: expect.any(Number),
                  title: "j3",
                  salary: 3000, 
                  equity: "0.3",
                  companyHandle: 'c3'
              },
              {
                  id: expect.any(Number),
                  title: "j4",
                  salary: 4000, 
                  equity: "0",
                  companyHandle: 'c3'
              }
            ],
      });
    });

    test("using filter {hasEquity: true}", async function () {
      const resp = await request(app).get("/jobs?hasEquity=true");
      expect(resp.body).toEqual({
        jobs:
            [
              {
                  id: expect.any(Number),
                  title: "j1",
                  salary: 1000, 
                  equity: "0.1",
                  companyHandle: "c1", 
              },
              {
                  id: expect.any(Number),
                  title: "j2",
                  salary: 2000, 
                  equity: "0.2",
                  companyHandle: 'c1'
              },
              {
                  id: expect.any(Number),
                  title: "j3",
                  salary: 3000, 
                  equity: "0.3",
                  companyHandle: 'c3'
              }
            ],
      });
    });

    test("using filter {minSalary: 2000}", async function () {
      const resp = await request(app).get("/jobs?minSalary=2000");
      expect(resp.body).toEqual({
        jobs:
            [
              {
                  id: expect.any(Number),
                  title: "j2",
                  salary: 2000, 
                  equity: "0.2",
                  companyHandle: 'c1'
              },
              {
                  id: expect.any(Number),
                  title: "j3",
                  salary: 3000, 
                  equity: "0.3",
                  companyHandle: 'c3'
              },
              {
                id: expect.any(Number),
                title: "j4",
                salary: 4000, 
                equity: "0",
                companyHandle: "c3", 
            },
            ],
      });
    });

    test("using filter {minSalary: 2000, hasEquity: true}", async function () {
      const resp = await request(app).get("/jobs?minSalary=2000&hasEquity=true");
      expect(resp.body).toEqual({
        jobs:
            [
              {
                  id: expect.any(Number),
                  title: "j2",
                  salary: 2000, 
                  equity: "0.2",
                  companyHandle: 'c1'
              },
              {
                  id: expect.any(Number),
                  title: "j3",
                  salary: 3000, 
                  equity: "0.3",
                  companyHandle: 'c3'
              },
            ],
      });
    });

    test("using filter {minSalary: 2000, hasEquity: false}", async function () {
      const resp = await request(app).get("/jobs?minSalary=2000&hasEquity=false");
      expect(resp.body).toEqual({
        jobs:
            [
              {
                  id: expect.any(Number),
                  title: "j2",
                  salary: 2000, 
                  equity: "0.2",
                  companyHandle: 'c1'
              },
              {
                  id: expect.any(Number),
                  title: "j3",
                  salary: 3000, 
                  equity: "0.3",
                  companyHandle: 'c3'
              },
              {
                  id: expect.any(Number),
                  title: "j4",
                  salary: 4000, 
                  equity: "0",
                  companyHandle: 'c3'
              },
            ],
      });
    });

    test("using filter {title: 3}", async function () {
      const resp = await request(app).get("/jobs?title=3");
      expect(resp.body).toEqual({
        jobs:
            [
              {
                  id: expect.any(Number),
                  title: "j3",
                  salary: 3000, 
                  equity: "0.3",
                  companyHandle: 'c3'
              },
            ],
      });
    });

  test("bad request with other search criteria", async function () {
    const resp = await request(app).get("/jobs?companyHandle=c1");
    expect(resp.statusCode).toEqual(400)
  });

  test("fails: test next() handler", async function () {
    // there's no normal failure event which will cause this route to fail ---
    // thus making it hard to test that the error-handler works with it. This
    // should cause an error, all right :)
    await db.query("DROP TABLE jobs CASCADE");
    const resp = await request(app)
      .get("/jobs")
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(500);
  });
});

// // /************************************** GET /jobs/:id */

describe("GET /jobs/:id", function () {
  test("works for anon", async function () {
    const { rows: result } =
      await db.query(`SELECT id, title, salary, equity, company_handle AS "companyHandle"
                                            FROM jobs 
                                            WHERE title = 'j1'`);
    const j1 = result[0];

    const resp = await request(app).get(`/jobs/${j1.id}`);
    expect(resp.body).toEqual({
      job: {
        id: expect.any(Number),
        title: "j1",
        salary: 1000,
        equity: "0.1",
        companyHandle: "c1",
      },
    });
  });

  test("not found for no such company", async function () {
    const resp = await request(app).get(`/companies/nope`);
    expect(resp.statusCode).toEqual(404);
  });
});

// // // /************************************** PATCH /companies/:handle */

describe("PATCH /companies/:handle", function () {
  test("works for admin", async function () {
    const { rows: result } =
      await db.query(`SELECT id, title, salary, equity, company_handle AS "companyHandle"
    FROM jobs 
    WHERE title = 'j1'`);

    const j1 = result[0];

    const resp = await request(app)
      .patch(`/jobs/${j1.id}`)
      .send({
        title: "J1-new",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({
      job: {
        ...j1,
        title: "J1-new",
      },
    });
  });

  test("unath for user", async function () {
    const { rows: result } =
      await db.query(`SELECT id, title, salary, equity, company_handle AS "companyHandle"
    FROM jobs 
    WHERE title = 'j1'`);

    const j1 = result[0];

    const resp = await request(app)
      .patch(`/jobs/${j1.id}`)
      .send({
        title: "J1-new",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unath for anon", async function () {
    const { rows: result } =
      await db.query(`SELECT id, title, salary, equity, company_handle AS "companyHandle"
    FROM jobs 
    WHERE title = 'j1'`);

    const j1 = result[0];

    const resp = await request(app).patch(`/jobs/${j1.id}`).send({
      title: "J1-new",
    });
    expect(resp.statusCode).toEqual(401);
  });

  test("not found on no such job", async function () {
    const resp = await request(app)
      .patch(`/jobs/0`)
      .send({
        title: "new nope",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request on companyHandle change attempt", async function () {
    const { rows: result } =
      await db.query(`SELECT id, title, salary, equity, company_handle AS "companyHandle"
      FROM jobs 
      WHERE title = 'j2'`);

    const j2 = result[0];

    const resp = await request(app)
      .patch(`/jobs/${j2.id}`)
      .send({
        companyHandle: "c2-new",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request on invalid data", async function () {
    const { rows: result } =
      await db.query(`SELECT id, title, salary, equity, company_handle AS "companyHandle"
      FROM jobs 
      WHERE title = 'j1'`);

    const j1 = result[0];

    const resp = await request(app)
      .patch(`/jobs/${j1.id}`)
      .send({
        salary: "the world!",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

// // // /************************************** DELETE /jobs/:id */

describe("DELETE /jobs/:id", function () {
  test("works for admin", async function () {
    const { rows: result } =
    await db.query(`SELECT id, title, salary, equity, company_handle AS "companyHandle"
    FROM jobs 
    WHERE title = 'j1'`);

  const j1 = result[0];

    const resp = await request(app)
        .delete(`/jobs/${j1.id}`)
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({ deleted: `${j1.id}` });
  });

  test("unauth for users", async function () {
    const { rows: result } =
    await db.query(`SELECT id, title, salary, equity, company_handle AS "companyHandle"
    FROM jobs 
    WHERE title = 'j1'`);

  const j1 = result[0];

    const resp = await request(app)
        .delete(`/jobs/${j1.id}`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for users", async function () {
    const { rows: result } =
    await db.query(`SELECT id, title, salary, equity, company_handle AS "companyHandle"
    FROM jobs 
    WHERE title = 'j1'`);

  const j1 = result[0];

    const resp = await request(app)
        .delete(`/jobs/${j1.id}`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const { rows: result } =
    await db.query(`SELECT id, title, salary, equity, company_handle AS "companyHandle"
    FROM jobs 
    WHERE title = 'j1'`);

  const j1 = result[0];

    const resp = await request(app)
        .delete(`/jobs/${j1.id}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such job", async function () {
    const resp = await request(app)
        .delete(`/jobs/0`)
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });
});
