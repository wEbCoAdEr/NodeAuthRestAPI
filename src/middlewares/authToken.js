const httpStatus = require('http-status');
const { authHelper } = require('../helpers');
const { tokenService } = require('../services');

/**
 * Authentication middleware for Express routes that require a valid token.
 *
 * This middleware verifies the presence and validity of an access token from the request.
 * It utilizes the `authHelper` and `tokenService` to extract, validate, and decode the token.
 *
 * @param {string} tokenType (optional) - The type of token to be verified. Defaults to 'passwordResetToken'.
 * @param {Function} callback (optional) - A callback function to be invoked after successful token verification.
 *                                          The callback receives the decoded token object and the request object as arguments.
 * @returns {Function} The middleware function to be used in Express routes.
 *
 * @example
 *  const { authToken } = require('../middlewares');
 *
 *  // Example route handler requiring authentication
 *  router.get('/protected/data', authToken(), async (req, res) => {
 *      const userData = req.tokenObject; // Access user data from decoded token (if applicable)
 *      // Your route handler logic here
 *      res.json({ message: 'Access granted!' });
 *  });
 */
const authToken = (tokenType = 'passwordResetToken', callback = null) => async (req, res, next) => {

  // 1. Get the access token from the request header
  const bearerToken = authHelper.fetchBearerToken(req);

  // 2. Validate token presence and format
  authHelper.validateToken(res, bearerToken);

  // 3. Verify the token using token service and the specified token type
  const tokenObject = await tokenService.verifyToken(bearerToken, tokenType);

  // 4. If token verification fails, send a forbidden error response
  if (!tokenObject) {
    return res.status(httpStatus.FORBIDDEN).json({
      message: 'Token verification failed'
    });
  }

  // 5. (Optional) Invoke callback function with decoded token and request object
  if (typeof callback === 'function') {
    callback(tokenObject, req);
  }

  // 6. Attach the decoded token object to the request object for further use in the route handler (optional)
  req.tokenObject = tokenObject;  // Example usage, adjust based on your needs

  // 7. Continue processing the request in the next middleware
  next();
}

module.exports = authToken;
