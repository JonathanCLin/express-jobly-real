process.env.NODE_ENV = "test"

const request = require("supertest");
const app = require("../../app");
const db = require("../../db");

describe("Testing Company Routes", function () {

  beforeEach(async function () {
    await db.query("DELETE FROM companies");

    let example = await db.query(`
  INSERT INTO companies (
    handle,
    name,
    num_employees,
    description,
    logo_url)
VALUES ('APL', 'Apple', 100, 'Great', 'Apple.com'), ('FB', 'Facebook', 10, 'Sucks', 'Facebook.com')
  `)
  })

  describe("GET /companies", function () {
    test("Get all companies", async function () {
      const response = await request(app).get("/companies");
      const companies = response.body.companies;
      expect(companies).toHaveLength(2);
      expect(companies[0]).toHaveProperty("name");
    })
  })

  describe("POST /companies", function () {
    test("Post a new company", async function () {
      const response = await request(app).post("/companies")
        .send({
          handle: "MYS",
          name: "MySpace", num_employees: 10000, description: "Rocks", logo_url: "www.Tom.com"
        });
      expect(response.statusCode).toBe(201);
      expect(response.body.company.name).toBe("MySpace");
    })
  })

  describe("GET /companies/:handle", function () {
    test("Get a single companies", async function () {
      const response = await request(app).get("/companies/APL");
      console.log("HERE", response.body)
      expect(response.body.company.name).toBe("Apple");
      expect(response.body.company).toHaveProperty("num_employees");
    })
  })

  describe("PATCH /companies/:handle", function () {
    test("Patch an existing company", async function () {
      const response = await request(app).patch("/companies/APL")
        .send({
          handle: "APL",
          name: "Apple",
          num_employees: 1, description: "Banana", logo_url: "www.Apple.com"
        });
      expect(response.body.company.description).toBe("Banana");
      expect(response.body.company).toHaveProperty("logo_url");
    })
  })

  describe("DELETE /companies/:handle", function () {
    test("Delete a single company", async function () {
      const response = await request(app).delete("/companies/FB")
      expect(response.body).toEqual({ Message: "Company Deleted" });
    });
  });

  afterAll(async function () {
    await db.end()
  })
})
