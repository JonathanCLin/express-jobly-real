const db = require("../db");
const ExpressError = require("../helpers/expressError");
const sqlForPartialUpdate = require("../helpers/partialUpdate");


class Job {
  static async create(title, salary, equity, company_handle) {
    let job = await db.query(
      `INSERT INTO jobs (
        title, 
        salary, 
        equity, 
        company_handle,
        date_posted)
      VALUES ($1, $2, $3, $4, current_timestamp)
      RETURNING id,
      title, 
      salary, 
      equity, 
      company_handle,
      date_posted`,
      [title, salary, equity, company_handle]
    );

    return job.rows[0];
  }

  static async all(min_salary = 0, min_equity = 0, search) {
    if (search) {
      let jobs = await db.query(
        `SELECT title, company_handle
          FROM jobs
          WHERE title LIKE $1 OR company_handle LIKE $1
          GROUP BY title, company_handle, salary, equity, date_posted
          HAVING salary > $2 AND equity > $3
          ORDER BY date_posted DESC`,
        [`%${search}%`, min_salary, min_equity]
      );
      return jobs.rows;
    }
    else {
      let jobs = await db.query(
        `SELECT title, company_handle
          FROM jobs
          GROUP BY title, company_handle, salary, equity,date_posted
          HAVING salary > $1 AND equity > $2
          ORDER BY date_posted DESC`,
        [min_salary, min_equity]
      );
      return jobs.rows;
    }

  }

  static async get(id) {
    let job = await db.query(
      `SELECT id,
      title, 
      salary, 
      equity, 
      company_handle,
      date_posted
      FROM jobs
      WHERE id=$1`,
      [id]);
    return job.rows[0];
  }


  static async patch(id, title, salary, equity, company_handle) {
    let items = {
      title,
      salary,
      equity,
      company_handle
    };
    let { query, values } = sqlForPartialUpdate('jobs', items, 'id', id);
    let company = await db.query(query, values);
    return company.rows[0];
  }

  static async delete(id) {
    let job = await db.query(
      `DELETE FROM jobs
        WHERE id=$1`,
      [id]);
  }

}

module.exports = Job;
