const { User } = require('../models');

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

module.exports = { checkRecord, createUser };
