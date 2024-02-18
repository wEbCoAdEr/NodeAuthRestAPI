const { logger } = require('../utils');
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
        // Log the error to the console
        logger.error(err.message);

        // Determine the status code for the response or use a default of 500 (Internal Server Error)
        const statusCode = err.statusCode || 500;

        // Get the error message from the error object or use a default message
        const errorMessage = err.message || "An Error Occurred";

        // Send a JSON response with the error message and status code
        res.status(statusCode).json({
            message: errorMessage,
        });

        // Exit the middleware to prevent further processing
        return;
    }

    // If there is no error, pass control to the next middleware
    next();
};

// Export the errorHandler middleware for use in the Express application
module.exports = errorHandler;
