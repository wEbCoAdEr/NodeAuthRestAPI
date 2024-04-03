const {User} = require('../models');

/**
 * Checks if a user record exists in the database based on the query object.
 * @param {Object} queryObject - Query object to find the user record.
 * @returns {Promise<boolean>} A boolean indicating if the user record exists.
 */
const checkRecord = async (queryObject) => {
  const user = await User.findOne(queryObject);
  return !!user;
};

/**
 * Creates a new user based on the provided request body.
 * @param {Object} requestBody - The request body containing user data.
 * @returns {Promise<Object>} The created user object.
 */
const createUser = async (requestBody) => {
  return User.create(requestBody);
};

const getUsers = async (query, options) => {
  return User.paginate(query, options);
}

const getUserById = async (id) => {
  return User.findById(id);
}

/**
 * Retrieves a user based on the provided query.
 *
 * @param {Object} query - The query to find the user.
 * @return {Promise<User>} A promise that resolves with the found user.
 */
const getUser = async (query) => {
  return User.findOne(query);
}

const updateUserById = async (id, updateData) => {
  return User.findOneAndUpdate({_id: id}, updateData, {
    new: true,
    runValidators: true
  });
}

module.exports = {
  checkRecord, createUser, getUsers, getUserById, getUser, updateUserById
};
