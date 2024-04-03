const httpStatus = require('http-status');
const {authHelper} = require('../helpers');
const {tokenService} = require('../services');

const authToken = (tokenType = 'passwordResetToken', callback = null) => async (req, res, next) => {

  // Get the access token
  const bearerToken = authHelper.fetchBearerToken(req);

  // Validated access token
  authHelper.validateToken(res, bearerToken);

  // Get token object by verifying the token using token service
  const tokenObject = await tokenService.verifyToken(bearerToken, tokenType);

  // If token verification fails, send a forbidden error response
  if (!tokenObject) {
    return res.status(httpStatus.FORBIDDEN).json({
      message: 'Token verification failed'
    });
  }

  // Invoke callback if provided
  if (typeof callback === 'function') {
    callback(tokenObject, req);
  }

  // Continue to the next middleware
  next();
}

module.exports = authToken;