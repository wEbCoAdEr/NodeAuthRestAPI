const joi = require('joi');
const httpStatus = require('http-status');

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

/**
 * Validates the request body against the given schema.
 * If there are validation errors, sends a response with 400 Bad Request status and the error messages.
 * @param {Joi.Schema} schema - The Joi validation schema to be used.
 * @param {express.Request} req - The Express request object.
 * @param {express.Response} res - The Express response object.
 * @param {express.NextFunction} next - The next middleware function.
 */
const validateSchema = (schema, req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
        // If there are validation errors, return the errors with 400 Bad Request status
        const errorMessage = error.details.map((err) => err.message);
        return res.status(httpStatus.BAD_REQUEST).json({ message: errorMessage });
    }
    next();
}

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

module.exports = { validateRegister, validateLogin };
