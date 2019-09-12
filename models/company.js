const db = require("../db");
const ExpressError = require("../helpers/expressError");
const sqlForPartialUpdate = require("../helpers/partialUpdate");


class Company {
    static async all(min = 0, max = 100000000, search) {
        if (search) {
            let companies = await db.query(
                `SELECT handle, name
                FROM companies
                WHERE handle LIKE $1 OR name LIKE $1
                GROUP BY handle, name
                HAVING num_employees > $2 AND num_employees < $3`,
                [`%${search}%`, min, max]
            );
            return companies.rows;
        }
        else {
            let companies = await db.query(
                `SELECT handle, name
                FROM companies
                GROUP BY handle, name
                HAVING num_employees > $1 AND num_employees < $2`,
                [min, max]
            );
            return companies.rows;
        }


    }

    static async create(handle, name, num_employees, description, logo_url) {
        let company = await db.query(
            `INSERT INTO companies (
                handle,
                name,
                num_employees,
                description,
                logo_url)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING handle,
                name,
                num_employees,
                description,
                logo_url`,
            [handle, name, num_employees, description, logo_url]
        );

        return company.rows[0];
    }

    static async get(handle) {
        let company = await db.query(
            `SELECT c.handle, c.name, c.num_employees, c.description, c.logo_url, j.title, j.salary, j.equity
            FROM companies AS c
            JOIN jobs AS j
            ON c.handle = j.company_handle
            WHERE c.handle=$1`,
            [handle]);
        console.log("model company", company)   
        let jobArray = []
        for (let row of company.rows) {
            let singleJob = {
                title: row.title,
                salary: row.salary,
                equity: row.equity
            }
            jobArray.push(singleJob)
        }
        let { name, num_employees, description, logo_url } = company.rows[0]
        let companyResults = {
            handle,
            name,
            num_employees,
            description,
            logo_url,
            jobs: jobArray
        }
        return companyResults;
    }

    static async patch(handle, name, num_employees, description, logo_url) {
        let items = {
            name,
            num_employees,
            description,
            logo_url
        }
        let { query, values } = sqlForPartialUpdate('companies', items, 'handle', handle)
        let company = await db.query(query, values);
        return company.rows[0];
    }

    static async delete(handle) {
        let company = await db.query(
            `DELETE FROM companies
            WHERE handle=$1`,
            [handle]);
    }

}

module.exports = Company;