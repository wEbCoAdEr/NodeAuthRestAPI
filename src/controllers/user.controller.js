/**
 * Controller for handling user-related operations.
 * @module controllers/user
 */

// Loads dependencies
const httpStatus = require('http-status');
const {catchAsync} = require('../utils');
const { userService } = require('../services');
const { pick } = require('../helpers');

/**
 * Get users based on provided query parameters.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Object} - Response containing users data.
 */
const getUsers = catchAsync(async (req, res) => {
  // Extract filter and options from query parameters
  const filter = pick(req.query, ['name', 'username', 'email', 'role']);
  const options = pick(req.query, ['page', 'limit', 'sortBy', 'populate']);

  // Call userService to get users based on filter and options
  const users = await userService.getUsers(filter, options);

  // Send response with users data
  return res.status(httpStatus.OK).json(users);
});

/**
 * Get user by ID.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Object} - Response containing user data.
 */
const getUserById = catchAsync(async (req, res) => {
  // Extract user ID from request parameters
  const { id } = req.params;

  // Call userService to get user by ID
  const user = await userService.getUserById(id);

  // Send response with user data
  return res.status(httpStatus.OK).json(user);
});

// Export controller methods
module.exports = {
  getUsers,
  getUserById
};
