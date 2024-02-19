const httpStatus = require('http-status');
const { ApiError } = require('../utils');

/**
 * Middleware function to convert non-API errors to ApiError instances.
 * @param {Error} err - The error object.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
const errorConverter = (err, req, res, next) => {
  // Check if an error exists
  if (err) {
    let error = err;
    // If the error is not an instance of ApiError, convert it to one
    if (!(error instanceof ApiError)) {
      // Extract the status code and message from the error, or use defaults
      const statusCode = error.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
      const message = error.message || httpStatus[statusCode];
      // Create a new ApiError instance with the extracted details
      error = new ApiError(statusCode, message, err.stack);
    }
    // Pass the error to the next middleware
    next(error);
  }
  // Call the next middleware
  next();
};

// Export the errorConverter middleware for use in other modules
module.exports = errorConverter;
