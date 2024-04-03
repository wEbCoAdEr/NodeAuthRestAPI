// Import dependencies
const httpStatus = require('http-status');


/**
 * Fetch and return the bearer token from the request headers.
 *
 * @param {object} req - the request object
 * @return {string} the bearer token extracted from the authorization header
 */
const fetchBearerToken = (req) => {
  const authHeader = req.headers['authorization'];
  return authHeader && authHeader.split(' ')[1];
}


/**
 * Validate the token and send an unauthorized error response if it is missing.
 *
 * @param {Object} res - The response object
 * @param {string} token - The access token to validate
 * @return {Object} - The JSON response with an error message if token is missing
 */
const validateToken = (res, token) => {
  // If the access token is missing, send an unauthorized error response
  if (typeof token === 'undefined') {
    return res.status(httpStatus.UNAUTHORIZED).json({
      message: 'Unauthorized user request'
    });
  }
}


/**
 * Sets the user ID from the token object to the request object.
 *
 * @param {object} tokenObject - The token object containing the user ID.
 * @param {object} req - The request object to set the user ID on.
 * @return {void}
 */
const setRequestUserId = (tokenObject, req) => {
  const {userId} = tokenObject;
  req.userId = userId;
}

module.exports = {
  fetchBearerToken,
  validateToken,
  setRequestUserId
}