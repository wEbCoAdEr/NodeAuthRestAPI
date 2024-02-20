const httpStatus = require('http-status');
const {logger} = require('../utils');
const config = require('../config');

/**
 * Middleware for handling errors in an Express.js application.
 *
 * @param {Error} err - The error object passed by Express.
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @param {Function} next - The callback to pass control to the next middleware.
 */
const errorHandler = (err, req, res, next) => {
  // Check if an error object exists
  if (err) {

    //Extract properties from the error object
    let {statusCode, message, stack} = err;

    // Set the status code if not set by the API Error class
    statusCode = statusCode || httpStatus.INTERNAL_SERVER_ERROR;

    //Construct the error response
    const errorResponse = {
      message,
      ...(config.ENV === 'DEVELOPMENT' && {stack}),
    };

    // Log the error to the console
    logger.error(err);

    // Send the error response
    res.status(statusCode).send(errorResponse);
  }

  // If there is no error, pass control to the next middleware
  next();
};

// Export the errorHandler middleware for use in the Express application
module.exports = errorHandler;
