"use strict";

const res = require("express/lib/response");
const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate, sqlForFilter } = require("../helpers/sql");

/** Related functions for companies. */

class Job {
  /** Create a job (from data), update db, return new company data.
   *
   * data should be { title, salary, equity, companyHandle }
   *
   * Returns { id, title, salary, equity, companyHandle }
   *
   * Throws BadRequestError if job already in database.
   * */

  static async create({ title, salary, equity, companyHandle }) {
    const duplicateCheck = await db.query(
      `SELECT title, salary, equity, company_handle
             FROM jobs
             WHERE title = $1 AND salary=$2 AND equity=$3 AND company_handle=$4`,
      [title, salary, equity, companyHandle]
    );

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate Job: ${title}`);

    const result = await db.query(
      `INSERT INTO jobs
           (title, salary, equity, company_handle)
           VALUES ($1, $2, $3, $4)
           RETURNING id, title, salary, equity, company_handle AS "companyHandle"`,
      [title, salary, equity, companyHandle]
    );
    const job = result.rows[0];

    return job;
  }

  /** Find all jobs.
   *
   * Returns [{ id, title, salary, equity, companyHandle}, ...]
   * */

  static async findAll() {
    const jobsRes = await db.query(
      `SELECT id, title, salary, equity, company_handle AS "companyHandle"
           FROM jobs
           ORDER BY title`
    );
    return jobsRes.rows;
  }

  /** Find all jobs based on any combination of following filters: title, salary, hasEquity.
   * name filter is case-insensitive
   * Throws BadRequestError if any other filters are passed 
   *
   * Returns [{ id, title, salary, equity, companyHandle }, ...]
   * */

  static async findWithFilter(dataObj) {
    const { hasEquity } = dataObj;

    // remove hasEquity if set to 'false' 
    // allows all jobs to be queried when only query being made is hasEquity = 'false'
    if (hasEquity === "true") dataObj.hasEquity = 0;
    else delete dataObj.hasEquity;

    // if the only query made is hasEquity is 'false'=> all jobs
    if (Object.keys(dataObj).length === 0) {
      const { rows } = await db.query(
        `SELECT id, title, salary, equity, company_handle AS "companyHandle" from jobs ORDER by title`
      );
      return rows;
    }

    const { setCols, values } = sqlForFilter(dataObj, {
      title: "title LIKE ",
      minSalary: "salary >=  ",
      hasEquity: "equity > ",
    });

    const querySql = `SELECT id,
                        title,
                        salary,
                        equity,
                        company_handle AS "companyHandle"
                        FROM jobs
                        WHERE ${setCols}
                        ORDER BY title;`;

    const jobsRes = await db.query(querySql, [...values]);
    const jobs =  jobsRes.rows;
    if (!jobs) return `No jobs meet filter criteria`
    return jobs
  }

  /** Given a job id, return data about job.
   *
   * Returns { id, title, salary, equity, company_handle }
   *
   * Throws NotFoundError if not found.
   **/

  static async get(id) {
    const jobRes = await db.query(
      `SELECT id, title, salary, equity, company_handle AS "companyHandle"
           FROM jobs
           WHERE id = $1`,
      [id]
    );

    const job = jobRes.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);

    return job;
  }

  /** Update job data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {title, salary, equity}
   *
   * Returns {id, title, salary, equity, companyHandle}
   *
   * Throws NotFoundError if not found.
   */

  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(data, {
      title: "title",
      salary: "salary",
      equity: "equity",
    });
    const idIdx = "$" + (values.length + 1);

    const querySql = `UPDATE jobs 
                      SET ${setCols} 
                      WHERE id = ${idIdx} 
                      RETURNING id, title, salary, equity, company_handle AS "companyHandle"`;
    const result = await db.query(querySql, [...values, id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);

    return job;
  }

  /** Delete given job from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

  static async remove(id) {
    const result = await db.query(
      `DELETE
           FROM jobs
           WHERE id = $1
           RETURNING id`,
      [id]
    );
    const job = result.rows[0];
    console.log(job);

    if (!job) throw new NotFoundError(`No job: ${id}`);
  }
}

module.exports = Job;
