//Loads dependency
const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const config = require('../config');
const {authValidator} = require('../validators');
const {authService, userService, tokenService} = require('../services');
const {authUser} = require('../middlewares');

/**
 * User registration API handler.
 *
 * This method handles the registration of a new user.
 * It validates the registration data, checks for duplicate emails and username,
 * creates a new user, and returns the created user object.
 *
 * @param {Request} req - The HTTP request object.
 * @param {Response} res - The HTTP response object.
 * @returns {Response} The HTTP response containing the created user object or an error message.
 */
const register = [
  authValidator.validateRegister,
  catchAsync(async (req, res) => {

    const {email, username} = req.body;

    const isEmailDuplicate = await userService.checkRecord({email});
    const isUsernameDuplicate = await userService.checkRecord({username});

    if (isEmailDuplicate) {
      return res.status(httpStatus.BAD_REQUEST).json({
        message: "The emails that you have entered is already exists"
      });
    }

    if (isUsernameDuplicate) {
      return res.status(httpStatus.BAD_REQUEST).json({
        message: "The username that you have entered is already exists"
      });
    }

    const user = await userService.createUser(req.body);
    const userObject = user.toObject();
    delete userObject.password;

    return res.status(httpStatus.CREATED).json(userObject);

  })
];


/**
 * User login API handler.
 *
 * This method handles the login process for a user.
 * It validates the login credentials, generates JWT tokens for authentication,
 * and returns the generated tokens.
 *
 * @param {Request} req - The HTTP request object.
 * @param {Response} res - The HTTP response object.
 * @returns {Response} The HTTP response containing the generated tokens and user data or an error message.
 */
const login = [
  authValidator.validateLogin,
  catchAsync(async (req, res) => {
    const {username, password} = req.body;
    const loginData = await authService.login(username, password, req.ip);
    return res.json(loginData);
  })
];


/**
 * Refresh token request API handler.
 *
 * This method handles the request to refresh an access token using a refresh token.
 * It verifies the refresh token, validates the associated user, generates a new access token,
 * and returns the new access token in the response.
 *
 * @param {Request} req - The HTTP request object.
 * @param {Response} res - The HTTP response object.
 * @returns {Response} The HTTP response containing the new access token or an error message.
 */
const token = catchAsync(async (req, res) => {

  const {refreshToken} = req.body;

  if (typeof refreshToken === 'undefined') {
    return res.status(httpStatus.UNAUTHORIZED).json({
      message: 'Unauthorized user request'
    });
  }

  jwt.verify(refreshToken, config.REFRESH_TOKEN_SECRET, async (error, tokenObject) => {

    //Send forbidden status if token verification fails
    if (error) {
      return res.status(httpStatus.FORBIDDEN).json({
        message: 'Refresh token verification failed'
      });
    }

    const userId = tokenObject.userId;

    //Process database token validation
    const checkRefreshToken = await tokenService.checkToken({
      user: userId,
      token: refreshToken
    });

    if (!checkRefreshToken) {
      return res.status(httpStatus.FORBIDDEN).json({
        message: "Refresh token verification failed"
      });
    }

    //Generate access token
    const accessToken = tokenService.generateToken({
      userId: userId,
      userRole: tokenObject.userRole,
      userIP: tokenObject.userIP
    });

    //Send response with new generated access token
    return res.json({
      accessToken: accessToken
    });

  });

});


/**
 * User logout API handler.
 *
 * This method handles the request to log out a user by invalidating the provided refresh token.
 * It verifies the refresh token, checks if it belongs to the authenticated user, performs the logout,
 * and returns an appropriate response indicating the success or failure of the logout operation.
 *
 * @param {Request} req - The HTTP request object.
 * @param {Response} res - The HTTP response object.
 * @returns {Response} The HTTP response indicating the success or failure of the logout operation.
 */
const logout = [
  authUser(),
  catchAsync(async (req, res) => {

    const refreshToken = req.body.refreshToken;

    if (typeof refreshToken === 'undefined') {
      return res.status(httpStatus.UNAUTHORIZED).json({
        message: 'Unauthorized user request'
      });
    }

    jwt.verify(refreshToken, config.REFRESH_TOKEN_SECRET, async (error, tokenObject) => {

      const tokenUserId = tokenObject.userId;
      const authUserId = req.userId;

      //Send forbidden status if token verification fails
      if (error || (tokenUserId !== authUserId)) {
        return res.status(httpStatus.FORBIDDEN).json({
          message: 'Refresh token verification failed'
        });
      }

      //Process logout
      const isLoggedOut = await authService.logout(refreshToken);

      //Send response
      if (isLoggedOut) {
        return res.sendStatus(httpStatus.NO_CONTENT);
      } else {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
          message: 'Failed to process the logout request'
        });
      }
    });
  })
];


const requestPasswordReset = [
  authValidator.validatePasswordReset,
  catchAsync(async (req, res) => {

    const {email} = req.body;
    const userData = await userService.getUser({email});

    if (!userData) {
      return res.status(httpStatus.NOT_FOUND).json({
        message: "Your provided emails address could not be found"
      });
    }

    const response = await authService.requestPasswordReset(userData);

    if (!response) {
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        message: "Failed to process password reset request"
      });
    }

    return res.status(httpStatus.ACCEPTED).json(response);

  })
];


module.exports = {register, login, token, logout, requestPasswordReset}