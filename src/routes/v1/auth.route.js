const express = require("express");
const {authController} = require('../../controllers');

const router = express.Router();


// Route for user registration
router.post('/register', authController.register);

// Route for user login
router.post('/login', authController.login);

// Route for refreshing access token
router.post('/token', authController.token);

// Route for user logout
router.post('/logout', authController.logout);

// Route for password reset request
router.post('/reset-password', authController.requestPasswordReset);

// Route for getting password reset token
router.get('/reset-password/:verificationCode', authController.getPasswordResetToken);

// Route for processing password reset
router.put('/reset-password', authController.processPasswordReset);


module.exports = router;
