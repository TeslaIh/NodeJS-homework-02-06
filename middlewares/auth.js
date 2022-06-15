const jwt = require("jsonwebtoken");
const { newError } = require("../additionals");
const { User } = require("../models/user");

const { SECRET_KEY } = process.env;

const auth = async (req, res, next) => {
  try {
    const { authorization = "" } = req.headers;
    const [bearer, token] = authorization.split(" ");
    if (bearer !== "Bearer") {
      throw newError(401);
    }
    try {
      const { id } = jwt.verify(token, SECRET_KEY);
      const user = await User.findById(id);
      if (!user || !token) {
        throw newError(401);
      }
      req.user = user;
      next();
    } catch (error) {
      throw newError(401);
    }
  } catch (error) {
    next(error);
  }
};

module.exports = auth;
