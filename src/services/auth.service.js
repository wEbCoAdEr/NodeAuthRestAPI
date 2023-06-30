const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config');
const { User, RefreshToken } = require('../models');

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
 * Generates an access token.
 * @param {Object} tokenData - Data to be included in the access token.
 * @returns {string} The generated access token.
 */
const generateAccessToken = (tokenData) => {
    return jwt.sign(tokenData, config.ACCESS_TOKEN_SECRET, {
        expiresIn: config.ACCESS_TOKEN_EXPIRATION,
    });
};

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
    const user = await User.findOne({ username });
    if (!user) {
        throw new Error('Invalid username entered');
    }

    // Verify user password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
        throw new Error('Invalid password entered');
    }

    // Generate JWT Access Token
    const tokenData = {
        userId: user._id
    };
    const accessToken = generateAccessToken(tokenData);

    // Generate JWT Refresh Token
    const refreshToken = jwt.sign(tokenData, config.REFRESH_TOKEN_SECRET);

    // Store the refresh token to the database
    RefreshToken.create({
        user: user._id,
        token: refreshToken,
        ip: ip
    });

    return {
        user: user,
        token: {
            accessToken: accessToken,
            refreshToken: refreshToken
        }
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
        console.log(`LOGOUT ERROR: ${err}`);
        return false;
    }
};

module.exports = { login, checkToken, generateAccessToken, logout };
