const joi = require('joi');
const {validateSchema} = require('./index');

// Validation schema for the register route
const registerSchema = joi.object({
  name: joi.string().required().trim().label('Name'),
  username: joi.string().required().label('Username'),
  email: joi.string().email().required().label('Email'),
  password: joi.string().min(8).required().label('Password'),
  role: joi.string().label('Role')
});

// Validation schema for the login route
const loginSchema = joi.object({
  username: joi.string().required().label('Username'),
  password: joi.string().min(8).required().label('Password'),
});

// Validate schema for password reset route
const passwordResetSchema = joi.object({
  email: joi.string().email().required().label('Email')
});

// Validate schema for password update
const passwordUpdateSchema = joi.object({
  password: joi.string().min(8).required().label('Password'),
  confirmPassword: joi.string().min(8).required().label('Confirm Password').valid(joi.ref('password')).messages({
    'any.only': 'Passwords do not match'
  })
})

/**
 * Middleware function to validate the request body for the register route.
 * @param {express.Request} req - The Express request object.
 * @param {express.Response} res - The Express response object.
 * @param {express.NextFunction} next - The next middleware function.
 */
const validateRegister = (req, res, next) => {
  validateSchema(registerSchema, req, res, next);
};

/**
 * Middleware function to validate the request body for the login route.
 * @param {express.Request} req - The Express request object.
 * @param {express.Response} res - The Express response object.
 * @param {express.NextFunction} next - The next middleware function.
 */
const validateLogin = (req, res, next) => {
  validateSchema(loginSchema, req, res, next);
};

/**
 * Validates a password reset request.
 *
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @param {Function} next - The next function
 * @return {void}
 */
const validatePasswordReset = (req, res, next) => {
  validateSchema(passwordResetSchema, req, res, next);
}

/**
 * Validate the password update request.
 *
 * @param {object} req - The request object
 * @param {object} res - The response object
 * @param {function} next - The next middleware function
 */
const validatePasswordUpdate = (req, res, next) => {
  validateSchema(passwordUpdateSchema, req, res, next);
}
module.exports = {
  validateRegister, validateLogin, validatePasswordReset, validatePasswordUpdate
};
