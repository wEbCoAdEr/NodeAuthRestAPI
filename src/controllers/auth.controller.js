//Loads dependency
const httpStatus = require('http-status');
const jwt = require('jsonwebtoken');
const { ApiError } = require('../utils');
const config = require('../config');
const {authValidator} = require('../validators');
const {authService, userService, tokenService} = require('../services');
const {authHelper, coreHelper} = require('../helpers');
const {catchAsync, authUser, authToken} = require('../middlewares');


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


/**
 * Handles the request to reset the password for a user.
 *
 * This method validates the password reset request, checks if the email address exists in the database,
 * associates the IP address with the user data, and sends a password reset request to the authentication service.
 * It returns an appropriate response indicating the success or failure of the password reset request.
 *
 * @param {Request} req - The HTTP request object.
 * @param {Response} res - The HTTP response object.
 * @returns {Response} The HTTP response indicating the success or failure of the password reset request.
 */
const requestPasswordReset = catchAsync(async (req, res) => {
  // Extract email from request body
  const {email} = req.body;

  // Find user data based on the provided email
  let userData = await userService.getUser({email});

  // If user data not found, return 404 response
  if (!userData) {
    return res.status(httpStatus.NOT_FOUND).json({
      message: "Your provided email address could not be found"
    });
  }

  // Convert user data to plain object and add IP address
  userData = userData.toObject();
  userData.ip = req.ip;

  // Request password reset for the user
  const response = await authService.requestPasswordReset(userData);

  // If password reset request fails, throw internal server error
  if (!response) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to process password reset request'
    );
  }

  // Return successful response with accepted status
  return res.status(httpStatus.ACCEPTED).json({
    message: 'Password reset request initiated successfully! Please check your email for the verification code.'
  });
});


/**
 * Get Password Reset Token API handler.
 *
 * This method handles the request to retrieve the password reset token
 * based on the provided verification code. It fetches the reset token data
 * using the verification code, verifies the token, and returns the password
 * reset token if it's valid.
 *
 * @param {Request} req - The HTTP request object.
 * @param {Response} res - The HTTP response object.
 * @returns {Response} The HTTP response containing the password reset token
 *                      if the verification is successful, otherwise returns
 *                      an error response.
 */
const getPasswordResetToken = catchAsync(async (req, res) => {

  // Extract verification code from request body
  const {verificationCode} = req.params;

  // Fetch reset token data using the verification code
  const tokenData = await tokenService.getPasswordResetToken({verificationCode});

  // If token data not found, return 400 response
  if (!tokenData) {
    return res.status(httpStatus.BAD_REQUEST).json({
      message: "Invalid password reset verification code"
    });
  }

  const {token} = tokenData;

  // Verify password reset token
  const tokenVerified = await tokenService.verifyToken(token, 'passwordResetToken');

  // If token verification fails, return 401 response
  if (!tokenVerified) {
    return res.status(httpStatus.UNAUTHORIZED).json({
      message: "Password reset token expired. Please initiate new password reset request."
    });
  }

  // Return successful response with password reset token
  return res.json({
    passwordResetToken: token
  });

});


/**
 * Process Password Reset Request.
 *
 * This method handles the request to update the user's password after successful
 * verification of the password reset token. It validates the password update,
 * updates the user's password in the database, and returns a response indicating
 * the success of the password update operation.
 *
 * @param {Request} req - The HTTP request object containing the user's new password.
 * @param {Response} res - The HTTP response object for sending the password update status.
 * @returns {Response} The HTTP response indicating the success of the password update operation.
 */
const processPasswordReset = [
  authToken('passwordResetToken', authHelper.setRequestUserId),
  authValidator.validatePasswordUpdate,
  catchAsync(async (req, res) => {

    // Extract the new password from the request body
    const {password} = req.body;

    // Update the user's password in the database
    await userService.updateUserById(req.userId, {
      password: coreHelper.hashString(password)
    });

    // Return a success response indicating the password update
    return res.status(httpStatus.OK).json({
      message: 'Account password updated successfully'
    });

  })
];


module.exports = {
  register,
  login,
  token,
  logout,
  requestPasswordReset,
  getPasswordResetToken,
  processPasswordReset
}