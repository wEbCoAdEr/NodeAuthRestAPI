/**
 * Error handling middleware.
 *
 * This middleware function handles errors that occur during request processing.
 * It logs the error and sends an appropriate error response with the corresponding status code and error message.
 *
 * @param {Error} err - The error object.
 * @param {Request} req - The HTTP request object.
 * @param {Response} res - The HTTP response object.
 * @param {function} next - The next middleware function.
 * @returns {void}
 */
const errorHandler = (err, req, res, next) => {

    console.log(`NEW ERROR CAUGHT: ${err}`);

    const statusCode = err.statusCode || 500;
    const errorMessage = err.message || 'An Error Occurred';

    res.status(statusCode).json({
        message: errorMessage
    });

}

module.exports = errorHandler;