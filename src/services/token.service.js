const jwt = require('jsonwebtoken');
const moment = require('moment');
const crypto = require('crypto');
const config = require('../config');
const {RefreshToken, PasswordResetToken} = require('../models');
const httpStatus = require("http-status");


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
 * Get Token Configuration.
 *
 * This method retrieves the corresponding secret key and expiration time
 * for the provided token type. It is used to determine the configuration
 * parameters for generating and verifying tokens.
 *
 * @param {string} type - The type of token (e.g., 'accessToken', 'refreshToken').
 * @returns {Object} An object containing the secret key and expiration time
 *                   for the specified token type.
 */
const getTokenConfig = (type) => {
  let secret;
  let expires;

  // Determine the secret key and expiration time based on the token type
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

  // Return an object containing the secret key and expiration time
  return {secret, expires};
}


/**
 * Generates a JWT token based on the provided data.
 * @param {Object} tokenData - Data to be included in the token.
 * @param {string} [type='access'] - Type of token to generate (either 'accessToken', 'passwordResetToken' or 'refreshToken').
 * @returns {string} Generated JWT token.
 */
const generateToken = (tokenData, type = 'accessToken') => {

  const {secret, expires} = getTokenConfig(type);

  return jwt.sign(tokenData, secret, {
    expiresIn: expires + 'm',
  });

};


/**
 * Verifies the provided token using the corresponding secret
 * based on the token type. It uses JSON Web Token (JWT) library to decode
 * and verify the token. If the token is valid, it returns the decoded token
 * object; otherwise, it returns false.
 *
 * @param {string} token - The token to verify.
 * @param {string} type - The type of token (e.g., 'accessToken', 'refreshToken').
 * @returns {(Object|boolean)} The decoded token object if verification is successful,
 *                              otherwise returns false.
 */
const verifyToken = async (token, type) => {

  // Get the secret key for the token type
  const {secret} = getTokenConfig(type);

  try {
    // Verify the token using JWT library
    const tokenObject = jwt.verify(token, secret);
    return tokenObject;
  } catch (e) {
    // Return false if verification fails
    return false;
  }

}


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


/**
 * Retrieves a password reset token based on the provided query.
 *
 * @param {Object} query - The query object used to search for the password reset token.
 * @return {Promise<Object>} A promise that resolves to the password reset token.
 */
const getPasswordResetToken = async (query) => {
  return PasswordResetToken.findOne(query);
}


module.exports = {
  checkToken,
  generateToken,
  verifyToken,
  generateAuthToken,
  generateVerificationCode,
  getPasswordResetToken
};
