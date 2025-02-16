/**
 * Controller for handling user-related operations.
 * @module controllers/user
 */

// Loads dependencies
const httpStatus = require('http-status');
const {catchAsync, authUser} = require('../middlewares');
const { userService, authService, tokenService} = require('../services');
const { coreHelper } = require('../helpers');
const {ApiError} = require("../utils");
const {validateDataRef} = require("../validators/auth.validator");

/**
 * Get users based on provided query parameters.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Object} - Response containing users data.
 */
const getUsers = catchAsync(async (req, res) => {
    // Extract filter and options from query parameters
    const filter = coreHelper.pick(req.query, ['name', 'username', 'email', 'role']);
    const options = coreHelper.pick(req.query, ['page', 'limit', 'sortBy', 'populate']);

    // Call userService to get users based on filter and options
    const users = await userService.getUsers(filter, options);

    // Send response with users data
    return res.status(httpStatus.OK).json(users);
});



/**
 * Get user by ID.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Object} - Response containing user data.
 */
const getUserById = catchAsync(async (req, res) => {
    // Extract user ID from request parameters
    const {id} = req.params;

    // Call userService to get user by ID
    const user = await userService.getUserById(id);
    const userObject = user.toObject();
    delete userObject.password;

    // Send response with user data
    return res.status(httpStatus.OK).json(userObject);
});



/**
 * Update user by ID.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Object} - Response containing updated user data.
 */
const updateUser = catchAsync(async (req, res, next) => {
    const {id} = req.params;
    const user = await userService.getUserById(id);
    if (!user) {
        return res.status(httpStatus.NOT_FOUND).json({message: 'User not found'});
    }

    const updatedUser = await userService.updateUserById(id, req.body);
    return res.status(httpStatus.OK).json(updatedUser);

});

const requestUserVerification = catchAsync(async (req, res) => {
    // Extract email from request body
    const {reference} = req.body;

    const validation = validateDataRef({reference});

    // If reference is not valid, return error response

    if (!validation.isValid) {
        return res.status(httpStatus.BAD_REQUEST).json({ message: validation.message });
    }

    // Get user data based on the reference value
    const userData = await userService.getUser({ [validation.type === 'email address' ? 'email' : 'contact_number']: reference });
    //res.json({ userData });
    // If user data not found, return 404 response
    if (!userData) {
        return res.status(httpStatus.NOT_FOUND).json({
            message: `Your provided ${validation.type} could not be found`
        });
    }

    if(userData.verified && userData.verified === true) {
        return res.status(httpStatus.NOT_FOUND).json({
            message: `User already verified`
        });
    }

    // Convert user data to plain object and add IP address
    //userData = userData.toObject();
    userData.ip = req.ip;

    // Generate email verification token (implementation depends on your token generation logic)
    const verificationToken = await authService.requestUserVerification(userData,validation.type);

    // If password reset request fails, throw internal server error
    if (!verificationToken) {
        throw new ApiError(
            httpStatus.INTERNAL_SERVER_ERROR,
            'Failed to user verification request'
        );
    }

    // Return success response
    return res.status(httpStatus.OK).json({
        message: `User verification request initiated successfully! Please check your ${validation.type} for the verification code.`
    });
});

const verifyUser = catchAsync(async (req, res) => {
    const { verificationCode } = req.params;

    // Fetch verification token data using the verification code type
    const tokenData = await tokenService.getVerificationToken({
        verificationCode,
        type: 'accountVerification'
    });

    //return res.json(tokenData);
    if (!tokenData) {
        return res.status(httpStatus.BAD_REQUEST).json({
            message: "Invalid code"
        });
    }

    const {token} = tokenData;

    const tokenVerified = await tokenService.verifyToken(token, 'accountVerification');

    // If token verification fails, return 401 response
    if (!tokenVerified) {
        return res.status(httpStatus.UNAUTHORIZED).json({
            message: "Verification token expired. Please initiate new verification request."
        });
    }


    const verifyAccount = await authService.verifyUserAccount(tokenData.user)

    // If token verification fails, return 401 response
    if (!verifyAccount) {
        return res.status(httpStatus.UNAUTHORIZED).json({
            message: "Account verification failed."
        });
    }

    return res.status(httpStatus.OK).json({
        message: "Account verification successful"
    });
});






// Export controller methods
module.exports = {
    getUsers,
    getUserById,
    updateUser,
    verifyUser,
    requestUserVerification
}
