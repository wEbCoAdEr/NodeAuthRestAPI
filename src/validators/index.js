// Load required dependencies
const httpStatus = require("http-status");

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

// Export validator components
module.exports.validateSchema = validateSchema;
module.exports.authValidator = require('./auth.validator');
