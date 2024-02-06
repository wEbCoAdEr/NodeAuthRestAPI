const bcrypt = require('bcryptjs');
const {User, RefreshToken} = require('../models');
const { tokenService } = require('../services');


/**
 * Handles user login process.
 * @param {string} username - The username entered by the user.
 * @param {string} password - The password entered by the user.
 * @param {string} ip - The IP address of the request.
 * @returns {Promise<Object>} An object containing the user and tokens.
 * @throws {Error} If the username or password is invalid.
 */
const login = async (username, password, ip) => {

  // Verify user username
  const user = await User.findOne({username});
  if (!user) {
    throw new Error('Invalid username entered');
  }

  // Verify user password
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    throw new Error('Invalid password entered');
  }

  // Initiate auth token object
  const tokenData = {
    userId: user._id,
    userRole: user.role,
    userIP: ip
  };

  const authToken = await tokenService.generateAuthToken(tokenData);

  //Generate user object and remove unnecessary properties
  const userObject = user.toObject();
  delete userObject.__v;
  delete userObject.password;

  return {
    user: userObject,
    token: authToken
  };
};


/**
 * Handles user logout process.
 * @param {string} refreshToken - The refresh token to be invalidated.
 * @returns {Promise<boolean>} A boolean indicating if the logout was successful.
 */
const logout = async (refreshToken) => {
  try {
    await RefreshToken.findOneAndDelete({
      token: refreshToken
    });
    return true;
  } catch (err) {
    return false;
  }
};

module.exports = {login, logout};
