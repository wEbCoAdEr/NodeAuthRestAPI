const jwt = require('jsonwebtoken');
const moment = require('moment');
const config = require('../config');
const { RefreshToken } = require('../models');

/**
 * Checks if a refresh token exists in the database.
 * @param {Object} queryObject - Query object to find the refresh token.
 * @returns {Promise<boolean>} A boolean indicating if the refresh token exists.
 */
const checkToken = async (queryObject) => {
  const token = await RefreshToken.findOne(queryObject);
  return !!token;
};

/**
 * Generates a JWT token based on the provided data.
 * @param {Object} tokenData - Data to be included in the token.
 * @param {string} [type='access'] - Type of token to generate (either 'accessToken' or 'refreshToken').
 * @returns {string} Generated JWT token.
 */
const generateToken = (tokenData, type = 'accessToken') => {

  const secret = type === 'accessToken' ? config.ACCESS_TOKEN_SECRET : config.REFRESH_TOKEN_SECRET;
  const expires = type === 'accessToken' ? config.ACCESS_TOKEN_EXPIRATION : config.REFRESH_TOKEN_EXPIRATION;

  return jwt.sign(tokenData, secret, {
    expiresIn: expires + 'm',
  });

};

/**
 * Generates JWT access and refresh tokens for the provided token data and stores
 * the refresh token in the database.
 * @param {Object} tokenData - Data to be included in the tokens.
 * @param {string} tokenData.userId - User ID to be included in the tokens.
 * @param {string} tokenData.userIP - User IP to be included in the tokens.
 * @returns {Promise<Object>} Object containing access and refresh tokens with their expiration times.
 */
const generateAuthToken = async (tokenData) => {
  // Calculate token expiration times
  const accessTokenExpires = moment().add(config.ACCESS_TOKEN_EXPIRATION, 'minutes').toDate();
  const refreshTokenExpires = moment().add(config.REFRESH_TOKEN_EXPIRATION, 'minutes').toDate();

  // Generate JWT Access and Refresh Token
  const accessToken = generateToken(tokenData);
  const refreshToken = generateToken(tokenData, 'refreshToken');

  // Store the refresh token to the database
  await RefreshToken.create({
    user: tokenData.userId,
    token: refreshToken,
    ip: tokenData.userIP,
    expires: refreshTokenExpires
  });

  // Return generated token object
  return {
    accessToken: {
      token: accessToken,
      expires: accessTokenExpires
    },
    refreshToken: {
      token: refreshToken,
      expires: refreshTokenExpires
    }
  };
};

module.exports = {
  checkToken,
  generateToken,
  generateAuthToken
};
