const httpStatus = require('http-status');
const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * Authentication middleware for user authorization.
 *
 * Middleware for authenticating users based on their access token and role.
 * @param {string[]} allowedRoles - An array of allowed roles for accessing the route.
 * @returns {Function} Middleware function to authenticate users.
 */
const authUser = (allowedRoles = []) => (req, res, next) => {

    // Get the access token from the request headers
    const authHeader = req.headers['authorization'];
    const accessToken = authHeader && authHeader.split(' ')[1];

    // If the access token is missing, send an unauthorized error response
    if (typeof accessToken === 'undefined') {
        res.status(httpStatus.UNAUTHORIZED).json({
            message: 'Unauthorized user request'
        });
        return;
    }

    // Verify the access token using the ACCESS_TOKEN_SECRET
    jwt.verify(accessToken, config.ACCESS_TOKEN_SECRET, (error, tokenObject) => {

        // If token verification fails, send a forbidden error response
        if (error) {
            res.status(httpStatus.FORBIDDEN).json({
                message: 'Access token verification failed'
            });
            return;
        }

        // Check user role against the allowedRole
        if (allowedRoles.length > 0 && !allowedRoles.includes(tokenObject.userRole)) {
            res.status(httpStatus.FORBIDDEN).json({
                message: `The current user is not allowed to perform this action`
            });
            return;
        }

        // If the token is valid, extract user information and attach it to the request object
        req.userId = tokenObject.userId;
        req.userRole = tokenObject.userRole;

        // Continue to the next middleware
        next();
    });
};


module.exports = authUser;