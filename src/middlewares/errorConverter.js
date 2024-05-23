const httpStatus = require('http-status');
const {ApiError} = require('../utils');
const mongoose = require('mongoose');

/**
 * Middleware function to convert non-API errors to ApiError instances.
 *
 * @param {Error} err - The error object.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
const errorConverter = (err, req, res, next) => {
  // Check if an error exists
  if (err) {
    let error = err;

    // Prioritize handling Mongoose CastErrors
    if (err instanceof mongoose.Error.CastError) {

      //Create new ApiError with 400 status code and preserve stack trace
      error = new ApiError(httpStatus.BAD_REQUEST, 'Invalid data format', err.stack);

    } else if (!(error instanceof ApiError)) {

      // Extract the status code and message from the original error
      const statusCode = err.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
      const message = err.message || httpStatus[statusCode];

      // Create a new ApiError with extracted details and preserve stack trace
      error = new ApiError(statusCode, message, err.stack);

    }

    // Pass the converted ApiError to the next middleware
    next(error);
  } else {
    // Call the next middleware if no error
    next();
  }
};

// Export the errorConverter middleware for use in other modules
module.exports = errorConverter;
