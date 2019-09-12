process.env.NODE_ENV = "test"

const request = require("supertest");
const app = require("../../app");
const db = require("../../db");

describe("Testing Company Routes", function () {

    beforeEach(async function () {
        await db.query("DELETE FROM companies");
        await db.query("DELETE FROM jobs");

        await db.query(`
            INSERT INTO companies (
            handle,
            name,
            num_employees,
            description,
            logo_url)
            VALUES ('APL', 'Apple', 100, 'Great', 'Apple.com'), 
            ('FB', 'Facebook', 10, 'Sucks', 'Facebook.com')
            `);

        await db.query(`
            INSERT INTO jobs (
            id,
            title, 
            salary, 
            equity, 
            company_handle,
            date_posted)
            VALUES (1, 'CEO', 100000, 0.40, 'APL', current_timestamp)
            `);
    })

    describe("POST /jobs", function () {
        test("Post a new job", async function () {
            const response = await request(app).post("/jobs")
                .send({
                    title: "CFO",
                    salary: 99999,
                    equity: 0.05,
                    company_handle: "APL"
                });
            expect(response.statusCode).toBe(201);
            expect(response.body.job.title).toBe("CFO");
        })
    })

    describe("GET /jobs", function () {
        test("Get all jobs", async function () {
            const response = await request(app).get("/jobs");
            const jobs = response.body.jobs;
            expect(jobs).toHaveLength(1);
            expect(jobs[0]).toHaveProperty("title");
        })
    })

    describe("GET /jobs/:id", function () {
        test("Get a single job", async function () {
            const response = await request(app).get("/jobs/1");
            expect(response.body.job.title).toBe("CEO");
            expect(response.body.job).toHaveProperty("equity");
        })
    })

    describe("PATCH /jobs/:id", function () {
        test("Patch an existing job", async function () {
            const response = await request(app).patch("/jobs/1")
                .send({
                    title: "CEO",
                    salary: 200000,
                    equity: 0.40,
                    company_handle: "APL"
                });
            expect(response.body.job.salary).toBe(200000);
            expect(response.body.job).toHaveProperty("title");
        })
    })

    describe("DELETE /jobs/:id", function () {
        test("Delete a single job", async function () {
            const response = await request(app).delete("/jobs/1");
            expect(response.body).toEqual({ Message: "Job Deleted" });
        });
    });

    afterAll(async function () {
        await db.end();
    })
})