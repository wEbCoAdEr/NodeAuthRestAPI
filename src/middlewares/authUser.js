const httpStatus = require('http-status');
const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * Authentication middleware for user authorization.
 *
 * This middleware function checks the validity of the access token provided in the request headers.
 * It verifies the access token, extracts the user ID from it, and attaches it to the request object (`req.userId`).
 * If the access token is missing or invalid, it sends an appropriate error response.
 *
 * @param {Request} req - The HTTP request object.
 * @param {Response} res - The HTTP response object.
 * @param {function} next - The next middleware function.
 * @returns {void}
 */
const authUser = (req, res, next) => {

    const authHeader = req.headers['authorization'];
    const accessToken = authHeader && authHeader.split(' ')[1];

    if (typeof accessToken === 'undefined') {
        res.status(httpStatus.UNAUTHORIZED).json({
            message: 'Unauthorized user request'
        });
        return;
    }

    jwt.verify(accessToken, config.ACCESS_TOKEN_SECRET, (error, tokenObject) => {

        //Send forbidden status if token verification fails
        if (error) {
            res.status(httpStatus.FORBIDDEN).json({
                message: 'Access token verification failed'
            });
            return;
        }

        req.userId = tokenObject.userId;
        next();

    });

}


module.exports = authUser;