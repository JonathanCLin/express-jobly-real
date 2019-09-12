const express = require("express");
const router = express.Router();
const Job = require("../models/job");
const jsonschema = require("jsonschema");
const jobSchema = require("../schemas/jobSchema.json");
const { ensureLoggedIn, ensureAdmin, authenticateJWT } = require("../middleware/auth")

const db = require("../db");
const ExpressError = require("../helpers/expressError");


router.get("/", authenticateJWT, async function (req, res, next) {
  try {
    const { search, min_salary, min_equity } = req.query;
    const jobs = await Job.all(min_salary, min_equity, search);
    return res.json({ jobs });
  }
  catch (err) {
    return next(err);
  }
})

router.post("/", ensureAdmin, async function (req, res, next) {
  try {
    const result = jsonschema.validate(req.body, jobSchema);

    if (!result.valid) {
      let listOfErrors = result.errors.map(error => error.stack);
      let error = new ExpressError(listOfErrors, 400);
      return next(error);
    }

    const { title, salary, equity, company_handle } = req.body;
    const job = await Job.create(title, salary, equity, company_handle);
    return res.json({ job }, 201);
  }
  catch (err) {
    return next(err);
  }
})


router.get("/:id", authenticateJWT, async function (req, res, next) {
  try {
    const { id } = req.params;
    const job = await Job.get(id);
    return res.json({ job });
  }
  catch (err) {
    return next(err);
  }
})

router.patch("/:id", ensureAdmin, async function (req, res, next) {
  try {
    const result = jsonschema.validate(req.body, jobSchema);

    if (!result.valid) {
      let listOfErrors = result.errors.map(error => error.stack);
      let error = new ExpressError(listOfErrors, 400);
      return next(error);
    }

    const { title, salary, equity, company_handle } = req.body;
    const id = req.params.id;
    const job = await Job.patch(id, title, salary, equity, company_handle);
    return res.json({ job });
  }
  catch (err) {
    return next(err);
  }
})

router.delete("/:id", ensureAdmin, async function (req, res, next) {
  try {
    const { id } = req.params;
    await Job.delete(id);
    return res.json({ Message: "Job Deleted" });
  }
  catch (err) {
    return next(err);
  }
})


module.exports = router;