const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config")
const ExpressError = require("../helpers/expressError");


function authenticateJWT(req, res, next) {
  try {
    const tokenFromBody = req.body._token;
    const payload = jwt.verify(tokenFromBody, SECRET_KEY);
    req.user = payload;
    return next();
  } catch (err) {
    return next();
  }
}

function ensureLoggedIn(req, res, next) {
  if (!req.user) {
    const err = new ExpressError("Unauthorized", 401);
    return next(err);
  } else {
    return next();
  }
}

function ensureCorrectUser(req, res, next) {
  try {
    const tokenFromBody = req.body._token;
    let token = jwt.verify(tokenFromBody, SECRET_KEY);
    req.user.username = token.username;

    if (token.username !== req.params.username) {
      return next();
    }
    throw new ExpressError("Unauthorized", 401)
  }
  catch(err) {
    return next(err);
  }
}

function ensureAdmin(req, res, next) {
  console.log(req.user)
  if (!req.user || req.user.is_admin === false) {
    const err = new ExpressError("Unauthorized", 401);
    return next(err);
  } else {
    return next();
  }
}


module.exports = {
  authenticateJWT, 
  ensureAdmin,
  ensureLoggedIn,
  ensureCorrectUser
};