const {User} = require('../models');
const {pick} = require('../helpers/core.helper');
const bcrypt = require('bcryptjs');


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

/**
 * Retrieves users based on the provided query and options.
 * @param {Object} query - The query to find the users.
 * @param {Object} options - Options for pagination and sorting.
 * @returns {Promise<Object>} The paginated users.
 */
const getUsers = async (query, options) => {
    return User.paginate(query, options);
}

/**
 * Retrieves a user by ID.
 * @param {String} id - The ID of the user to retrieve.
 * @returns {Promise<Object>} The user object.
 */
const getUserById = async (id) => {
    return User.findById(id);
}


/**
 * Retrieves a user based on the provided query.
 * @param {Object} query - The query to find the user.
 * @returns {Promise<Object>} The user object.
 */
const getUser = async (query) => {
    return User.findOne(query);
}

/**
 * Updates a user by ID.
 * @param {String} id - The ID of the user to update.
 * @param {Object} updateData - The data to update the user with.
 * @returns {Promise<Object>} The updated user object.
 */
const updateUserById = async (id, updateData) => {
    const allowedUpdates = ['name', 'username', 'email', 'contact_number', 'password', 'date_of_birth', 'gender', 'is_active'];
    const filteredUpdateData = pick(updateData, allowedUpdates);
    return User.findOneAndUpdate({_id: id}, filteredUpdateData, {
        new: true,
        runValidators: true,
    });
};

/**
 * Updates the password of a user by ID.
 * @param {String} id - The ID of the user to update.
 * @param {String} newPassword - The new password to set.
 * @returns {Promise<Object>} The updated user object.
 */
const updatePassword = async (id, newPassword) => {
    const hashedPassword = await bcrypt.hash(newPassword, 8);
    return User.findOneAndUpdate({_id: id}, {password: hashedPassword}, {
        new: true,
        runValidators: true,
    });
};





module.exports = {
    checkRecord,
    createUser,
    getUsers,
    getUserById,
    getUser,
    updateUserById,
    updatePassword
};