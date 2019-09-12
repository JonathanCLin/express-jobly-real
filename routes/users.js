/** Routers for users */
const express = require("express");
const router = express.Router();
const User = require("../models/user");
const jsonschema = require("jsonschema");
const userSchema = require("../schemas/userSchema.json");

const ExpressError = require("../helpers/expressError");


router.get("/", async function (req, res, next) {
    try {
        const users = await User.all();
        return res.json({ users });
    }
    catch (err) {
        return next(err);
    }
})

router.post("/", async function (req, res, next) {
    try {
        const result = jsonschema.validate(req.body, userSchema);
        
        if(!result.valid) {
            let listOfErrors = result.errors.map(error => error.stack);
            let error = new ExpressError(listOfErrors, 400);
            return next(error);
        }

        const { username, password, first_name, last_name, email, photo_url, is_admin } = req.body;
        const user = await User.create(username, password, first_name, last_name, email, photo_url, is_admin);
        return res.json({ user }, 201);
    }
    catch (err) {
        return next(err);
    }
})

router.get("/:username", async function (req, res, next) {
    try {
        const user = await User.get(req.params.username);
        
        return res.json({ user });
    }
    catch (err) {
        return next(err);
    }
})

router.patch("/:username", async function (req, res, next) {
    try {
        const result = jsonschema.validate(req.body, userSchema);
        
        if(!result.valid) {
            let listOfErrors = result.errors.map(error => error.stack);
            let error = new ExpressError(listOfErrors, 400);
            return next(error);
        }
        
        const { first_name, last_name, email, photo_url } = req.body;
        const { username } = req.params;
        const user = await User.patch(username, first_name, last_name, email, photo_url);
        return res.json({ user });
    }
    catch (err) {
        return next(err);
    }
})

router.delete("/:username", async function (req, res, next) {
    try {
        const { username } = req.params;
        await Company.delete(username);
        return res.json({ Message: "User Deleted" });
    }
    catch (err) {
        return next(err);
    }
})

module.exports = router;