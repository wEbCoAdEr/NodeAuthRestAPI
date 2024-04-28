/**
 * Error handling middleware for asynchronous functions in Express routes.
 *
 * This middleware function wraps an asynchronous function and gracefully handles any errors thrown within it.
 * It ensures a consistent approach to error handling across your application.
 *
 * @param {Function} fn - The asynchronous function to be wrapped. This function should typically be
 *                          an Express route handler that takes 'req', 'res', and 'next' arguments.
 * @returns {Function} The wrapped function with error handling middleware applied.
 *
 * @example
 *  const catchAsync = require('../middlewares/catchAsync');
 *
 *  // Example route handler with error handling
 *  router.get('/users', catchAsync(async (req, res, next) => {
 *      const users = await User.find();
 *      res.json(users);
 *  }));
 */

const catchAsync = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};

module.exports = catchAsync;
