/** Routers for companies */
const express = require("express");
const router = express.Router();
const Company = require("../models/company");
const jsonschema = require("jsonschema");
const companySchema = require("../schemas/companySchema.json");

const db = require("../db");
const ExpressError = require("../helpers/expressError");


router.get("/", async function (req, res, next) {
    try {
        const { search, min_employees, max_employees } = req.query;
        const companies = await Company.all(min_employees, max_employees, search);
        return res.json({ companies });
    }
    catch (err) {
        return next(err);
    }
})

router.post("/", async function (req, res, next) {
    try {
        const result = jsonschema.validate(req.body, companySchema);
        
        if(!result.valid) {
            let listOfErrors = result.errors.map(error => error.stack);
            let error = new ExpressError(listOfErrors, 400);
            return next(error);
        }

        const { handle, name, num_employees, description, logo_url } = req.body;
        const company = await Company.create(handle, name, num_employees, description, logo_url);
        return res.json({ company }, 201);
    }
    catch (err) {
        return next(err);
    }
})

router.get("/:handle", async function (req, res, next) {
    try {
        const company = await Company.get(req.params.handle);
        return res.json({ company });
    }
    catch (err) {
        return next(err);
    }
})

router.patch("/:handle", async function (req, res, next) {
    try {
        const result = jsonschema.validate(req.body, companySchema);
        
        if(!result.valid) {
            let listOfErrors = result.errors.map(error => error.stack);
            let error = new ExpressError(listOfErrors, 400);
            return next(error);
        }
        
        const { name, num_employees, description, logo_url } = req.body;
        const handle = req.params.handle;
        const company = await Company.patch(handle, name, num_employees, description, logo_url);
        return res.json({ company });
    }
    catch (err) {
        return next(err);
    }
})

router.delete("/:handle", async function (req, res, next) {
    try {
        const { handle } = req.params;
        await Company.delete(handle);
        return res.json({ Message: "Company Deleted" });
    }
    catch (err) {
        return next(err);
    }
})


module.exports = router;