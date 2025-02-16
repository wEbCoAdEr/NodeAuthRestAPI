const express = require("express");
const { userController} = require('../../controllers')

const router = express.Router();

// Route for user root endpoint
router
    .route("/")
    .get(userController.getUsers);

// Route for user id endpoints
router
    .route("/:id")
    .get(userController.getUserById)
    .put(userController.updateUser);

//route for requesting user verification
router.post('/verify', userController.requestUserVerification);
router.put('/verify/:verificationCode', userController.verifyUser);


module.exports = router;
