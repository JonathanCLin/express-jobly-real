/** Express app for jobly. */

const express = require("express");
const ExpressError = require("./helpers/expressError");
const morgan = require("morgan");
const app = express();
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrpyt")
const { SECRET_KEY, BCRYPT_WORK_FACTOR } = require("../config")


app.use(express.json());

// add logging system
app.use(morgan("tiny"));


const companyRoutes = require("./routes/companies");
const jobRoutes = require("./routes/jobs");
const userRoutes = require("./routes/users");

app.use("/companies", companyRoutes)
app.use("/jobs", jobRoutes)
app.use("/users", userRoutes)

app.post("/login", async function (req, res, next) {
  try {
    const { username, password } = req.body;
    const result = await db.query(`
  SELECT password, is_admin FROM users
  WHERE username=$1`,
      [username])
    const user = result.rows[0];

    if (user) {
      if (await bcypt.compare(password, user.password) === true) {
        const token = jwt.sign({ username }, SECRET_KEY);
        return res.json({ token })
      }
    }
    throw new ExpressError("Invalid user/password", 400);
  } catch (err) {
    return next(err)
  }
})

/** 404 handler */

app.use(function (req, res, next) {
  const err = new ExpressError("Not Found", 404);
  // pass the error to the next piece of middleware
  return next(err);
});

/** general error handler */

app.use(function (err, req, res, next) {
  console.log(err)
  res.status(err.status || 500);


  return res.json({
    status: err.status,
    message: err.message
  });
});

module.exports = app;
