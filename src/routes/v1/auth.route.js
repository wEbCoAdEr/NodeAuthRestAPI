const { router, authController } = require('../../controllers');

// Route for user registration
router.post('/register', authController.register);

// Route for user login
router.post('/login', authController.login);

// Route for refreshing access token
router.post('/token', authController.token);

// Route for user logout
router.post('/logout', authController.logout);

module.exports = router;
