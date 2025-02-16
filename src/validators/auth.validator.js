const joi = require('joi');
const {validateSchema} = require('./index');
const { userService} = require('../services');
const httpStatus = require('http-status');

// Validation schema for the register route
const registerSchema = joi.object({
  name: joi.string().required().trim().label('Name'),
  username: joi.string().required().label('Username'),
  contact_number: joi.string().required().pattern(/^[0-9]{11}$/, 'contact_number').messages({
    'string.pattern': 'Contact number must be a 10-digit number'
  }).label('contact_number'),
  email: joi.string().email().required().label('Email'),
  password: joi.string().min(8).required().label('Password'),
  date_of_birth: joi.date().required().label('Date of Birth'),
  gender: joi.string().valid('male', 'female', 'other').required().label('Gender'),
  role: joi.string().label('Role')
});



// Validation schema for the login route
const loginSchema = joi.object({
  login: joi.string().required().label('Login'),
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

// Validation schema for updating user data
const userUpdateSchema = joi.object({
  name: joi.string().trim().label('Name'),
  username: joi.string().label('Username'),
  email: joi.string().email().label('Email')
});

//Password Change schema for change passowrd
const passwordChangeSchema = joi.object({
  oldPassword: joi.string().min(8).required().label('Old Password'),
  newPassword: joi.string().min(8).required().label('New Password'),
  confirmPassword: joi.string().min(8).required().valid(joi.ref('newPassword')).label('Confirm Password').messages({
    'any.only': 'Passwords do not match'
  })
});



/**
 * Middleware function to validate the request body for the register route.
 * @param {express.Request} req - The Express request object.
 * @param {express.Response} res - The Express response object.
 * @param {express.NextFunction} next - The next middleware function.
 */
const validateRegister = (req, res, next) => {
  validateSchema(registerSchema, req, res, next);
};
const validateUserUpdate = (req, res, next) => {
  validateSchema(userUpdateSchema, req, res, next);
};

const validatePasswordChange = (req, res, next) => {
  validateSchema(passwordChangeSchema, req, res, next);
};


const validateDuplicateUser = async (req, res, next) => {
  const {email, username, contact_number} = req.body;

  const isContactDuplicate = await userService.checkRecord({contact_number});
  const isEmailDuplicate = await userService.checkRecord({email});
  const isUsernameDuplicate = await userService.checkRecord({username});

  if (isContactDuplicate) {
    return res.status(httpStatus.BAD_REQUEST).json({
      message: "The contact number that you have entered is already exists"
    });
  }

  if (isEmailDuplicate) {
    return res.status(httpStatus.BAD_REQUEST).json({
      message: "The emails that you have entered is already exists"
    });
  }

  if (isUsernameDuplicate) {
    return res.status(httpStatus.BAD_REQUEST).json({
      message: "The username that you have entered is already exists"
    });
  }

  next();
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

// Define the email schema
const emailSchema = joi.string().email();

// Define the contact number schema
// Assuming contact number is a string of digits with optional '+' at the beginning
const contactNumberSchema = joi.string().pattern(/^\+?\d+$/);

// Define the combined schema using alternatives
const referenceSchema = joi.alternatives().try(emailSchema, contactNumberSchema).label('Reference');

const schema = joi.object({
  reference: referenceSchema.required()
});

const validateDataRef = (data) => {
  const { error, value } = schema.validate(data);
  if (error) {
    return { isValid: false, message: error.details[0].message };
  } else {
    const isEmail = emailSchema.validate(data.reference).error === undefined;
    return { isValid: true, value, type: isEmail ? 'email address' : 'contact number' };
  }
};

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
  validateRegister, validateLogin, validatePasswordReset, validatePasswordUpdate, validateDuplicateUser,validateDataRef,validateUserUpdate, validatePasswordChange
}
