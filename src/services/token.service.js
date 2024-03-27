const jwt = require('jsonwebtoken');
const moment = require('moment');
const crypto = require('crypto');
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
 * @param {string} [type='access'] - Type of token to generate (either 'accessToken', 'passwordResetToken' or 'refreshToken').
 * @returns {string} Generated JWT token.
 */
const generateToken = (tokenData, type = 'accessToken') => {

  let secret;
  let expires;

  switch (type) {
    case 'refreshToken':
      secret = config.REFRESH_TOKEN_SECRET;
      expires = config.REFRESH_TOKEN_EXPIRATION;
      break;
    case 'accessToken':
      secret = config.ACCESS_TOKEN_SECRET;
      expires = config.ACCESS_TOKEN_EXPIRATION;
      break;
    default:
      secret = config.PASSWORD_RESET_TOKEN_SECRET;
      expires = config.PASSWORD_RESET_TOKEN_EXPIRATION;
  }

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

/**
 * Generates a verification token as a 6-digit string.
 *
 * @return {string} The generated verification token
 */
const generateVerificationCode = () => {
  return crypto.randomInt(100000, 999999 + 1)
    .toString().padStart(6, '0');
}

module.exports = {
  checkToken,
  generateToken,
  generateAuthToken,
  generateVerificationCode
};
