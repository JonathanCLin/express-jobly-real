/** Routers for users */
const express = require("express");
const router = express.Router();
const User = require("../models/user");
const jsonschema = require("jsonschema");
const userSchema = require("../schemas/userSchema.json");
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const { SECRET_KEY, BCRYPT_WORK_FACTOR } = require("../config")
const ExpressError = require("../helpers/expressError");
const { ensureLoggedIn } = require("../middleware/auth")


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

        if (!result.valid) {
            let listOfErrors = result.errors.map(error => error.stack);
            let error = new ExpressError(listOfErrors, 400);
            return next(error);
        }

        const { username, password, first_name, last_name, email, photo_url, is_admin } = req.body;
        const hashedpassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR) //put to model
        const user = await User.create(username, hashedpassword, first_name, last_name, email, photo_url, is_admin);
        if (user) {
            const token = jwt.sign({ username, is_admin }, SECRET_KEY);
            return res.json({ token });
        }
        throw new ExpressError("Invalid user/password", 400);
    } catch (err) {
        return next(err);
    }
})

//If no user, express error with 404 (For patch and delete as well)
router.get("/:username", async function (req, res, next) {
    try {
        const user = await User.get(req.params.username);

        return res.json({ user });
    }
    catch (err) {
        return next(err);
    }
})

//CREATE ENSURE CORRECT USER MIDDLEWARE 
router.patch("/:username", ensureLoggedIn, async function (req, res, next) {
    try {
        const result = jsonschema.validate(req.body, userSchema);

        if (!result.valid) {
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

//CREATE ENSURE CORRECT USER MIDDLEWARE 
router.delete("/:username", ensureLoggedIn, async function (req, res, next) {
    try {
        const { username } = req.params;
        await User.delete(username);
        return res.json({ Message: "User Deleted" });
    }
    catch (err) {
        return next(err);
    }
})

module.exports = router;