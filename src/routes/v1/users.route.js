const express = require("express");
const { userController } = require('../../controllers');

const router = express.Router();

// Route for user root endpoint
router
  .route("/")
  .get(userController.getUsers)

// Route for user id endpoints
router
  .route("/:id")
  .get(userController.getUserById)

module.exports = router;
