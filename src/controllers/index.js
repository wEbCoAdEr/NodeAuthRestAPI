const express = require("express");
module.exports.authController = require('./auth.controller');
module.exports.userController = require('./user.controller');
module.exports.router = express.Router();