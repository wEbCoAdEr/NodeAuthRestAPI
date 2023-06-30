/**
 * Wraps an asynchronous function with error handling middleware.
 * @param {Function} fn - The asynchronous function to be wrapped.
 * @returns {Function} The wrapped function with error handling.
 */
const catchAsync = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};

module.exports = catchAsync;
