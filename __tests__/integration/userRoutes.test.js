process.env.NODE_ENV = "test"

const request = require("supertest");
const app = require("../../app");
const db = require("../../db");

describe("Testing User Routes", function () {

  beforeEach(async function () {
    await db.query("DELETE FROM users");
    await db.query(`
        INSERT INTO users (
          username, 
          password, 
          first_name, 
          last_name, 
          email, 
          photo_url, 
          is_admin)
        VALUES ('MacGlass', 'Apple', 'Mac', 'Glass', 'Mac@Glass.com', 'mac.com', true)
        `);
  })

  describe("GET /users", function () {
    test("Get all users", async function () {
      const response = await request(app).get("/users");
      const { users } = response.body;
      expect(users).toHaveLength(1);
      expect(users[0].username).toBe("MacGlass");
    })
  })

  describe("POST /users", function () {
    test("Post a new user", async function () {
      const response = await request(app).post("/users")
        .send({
          username: "JadedJon",
          password: "Jaded",
          first_name: "Jon",
          last_name: "Lin",
          email: "JLin@JeremyLin.com",
          photo_url: "Linsanity.com",
          is_admin: true
        });
      expect(response.statusCode).toBe(201);
      expect(response.body.user.last_name).toBe("Lin");
      //expect two users with get
    })
  })

  describe("GET /users/:username", function () {
    test("Get a single user", async function () {
      const response = await request(app).get("/users/MacGlass");
      expect(response.body.user.last_name).toBe("Glass");
      expect(response.body.user).toHaveProperty("photo_url");
    })
    // sad path (bad user)
  })


  describe("PATCH /users/:username", function () {
    test("Patch an existing user", async function () {
      const response = await request(app).patch("/users/MacGlass")
        .send({
          username: "MacGlass",
          password: "Apple",
          first_name: "Mac",
          last_name: "Glass",
          email: "MacGlass@JeremyLin.com",
          photo_url: "Mac.com",
          is_admin: true
        });
      expect(response.body.user.email).toBe("MacGlass@JeremyLin.com");
      expect(response.body.user).toHaveProperty("email");
    })
    //404 test as well as additional get to check length
  })

  describe("DELETE /users/:username", function () {
    test("Delete a single user", async function () {
      const response = await request(app).delete("/users/MacGlass");
      expect(response.body).toEqual({ Message: "User Deleted" });
    });
  });
    //404 test as well as additional get to check length

  afterAll(async function () {
    await db.end();
  })
})

