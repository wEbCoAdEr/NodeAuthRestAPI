//Loads dependency
const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const {userService} = require('../services');

const getUsers = catchAsync(async (req, res) => {
  const {page, limit, sortBy, populate, ...filter} = req.query;
  const options = {page, limit, sortBy, populate};
  const users = await userService.getUsers(filter, options);
  return res.status(httpStatus.OK).json(users);
});

const getUserById = catchAsync(async (req, res) => {
  const {id} = req.params;
  const user = await userService.getUserById(id);
  return res.status(httpStatus.OK).json(user);
});

module.exports = {
  getUsers,
  getUserById
}