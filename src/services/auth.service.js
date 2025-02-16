
const bcrypt = require('bcryptjs');
const moment = require('moment');
const {User, RefreshToken, VerificationToken, Doctor} = require('../models');
const {tokenService} = require('../services');
const {mailer, ApiError} = require('../utils');
const config = require('../config');
const joi = require("joi");
const {userService} = require("./index");
const {sendSMS} = require('../utils');
const {BAD_REQUEST} = require("http-status");
const httpStatus = require("http-status");


/**
 * Handles user login process.
 * @param {string} login - The login entered by the user can be username, contact number or email.
 * @param {string} password - The password entered by the user.
 * @param {string} ip - The IP address of the request.
 * @returns {Promise<Object>} An object containing the user and tokens.
 * @throws {Error} If the username or password is invalid.
 */

//TODO:: Error Handling
const login = async (login, password, ip) => {

  let user;
  if (joi.string().email().validate(login).error === undefined) {
    user = await User.findOne({email: login});
  } else if (joi.string().pattern(/^[0-9]{11}$/).validate(login).error === undefined) {
    user = await User.findOne({contact_number: login});
  } else {
    user = await User.findOne({username: login});
  }

  if (!user) {
    throw new ApiError(BAD_REQUEST, 'Invalid User');
  }

  // Verify user password
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    throw new ApiError(BAD_REQUEST, 'Invalid password');
  }

  if(!user.verified){
    throw new ApiError(httpStatus.UNAUTHORIZED, 'User not verified');
  }
  
  // Initiate auth token object
  const tokenData = {
    userId: user._id,
    userRole: user.role,
    userIP: ip
  };

  const authToken = await tokenService.generateAuthToken(tokenData);

  //Generate user object and remove unnecessary properties
  const userObject = user.toObject();
  delete userObject.__v;
  delete userObject.password;

  return {
    user: userObject,
    token: authToken
  };
};

/**
 * Verifies a user's password.
 * @param {Object} userId - The ID of the user.
 * @param {string} password - The password to verify.
 * @returns {Promise<boolean>} A boolean indicating if the password is correct.
 */
const verifyPassword = async (userId, password) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  return await bcrypt.compare(password, user.password);
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
    return false;
  }
};

const requestPasswordReset = async (userData,type) => {

  const {_id, email, role, ip, username, contact_number} = userData;

  const verificationCode = tokenService.generateVerificationCode();

  //process token generation and database insert
  const VerificationTokenExpires = moment().add(config.PASSWORD_RESET_TOKEN_EXPIRATION, 'minutes').toDate();
  const userVerificationToken = tokenService.generateToken({
    userId: _id,
    userRole: role,
    userIP: ip
  }, 'passwordResetToken');

  const message = `Dear ${username},\n\nYour OTP is ${verificationCode}.\n\nThank you.`;
  if (type === 'contact number') {


    const smsData = await sendSMS({

      number: contact_number,
      message: message
    });
  } else {

    const sendEmail = await mailer.send({
      toList: [email],
      subject: 'Password Reset Request',
      template: 'passwordReset',
      templateData: {
        username,
        verificationCode
      }
    });

  }


    if (!mailer.send && !sendSMS) {
      return false;
    }

    // Delete previous reset token records of the user if any
    await VerificationToken.deleteMany({user: _id, type: 'passwordReset'});

    return VerificationToken.create({
      user: _id,
      verificationCode,
      token: userVerificationToken,
      ip,userVerificationToken,
      expires: VerificationTokenExpires,
      type: 'passwordReset'
    });

  }



  // Delete previous reset token records of the user if any


const requestUserVerification = async (userData,type) => {
  const { _id, email, role, ip, username ,contact_number} = userData;

  const verificationCode = tokenService.generateVerificationCode();

  // Process token generation and database insert
  const VerificationTokenExpires = moment().add(config.EMAIL_VERIFICATION_TOKEN_EXPIRATION, 'minutes').toDate();
  const userVerificationToken = tokenService.generateToken({
    userId: _id,
    userRole: role,
    userIP: ip
  }, 'userVerificationToken');


  const message = `Dear ${username},\n\nYour OTP is ${verificationCode}.\n\nThank you.`;
  if (type === 'contact number') {


    const smsData = await sendSMS({

      number: contact_number,
      message: verificationCode
    });
  } else {

    const sendEmail = await mailer.send({
      toList: [email],
      subject: 'Verification Request',
      template: 'User Verification',
      templateData: {
        username,
        verificationCode
      }
    });

  }



  if (!mailer.send && !sendSMS) {
    return false;
  }

  // Delete previous reset token records of the user if any
  await VerificationToken.deleteMany({user: _id, type: 'accountVerification'});

  return VerificationToken.create({
    user: _id,
    verificationCode,
    token: userVerificationToken,
    ip,userVerificationToken,
    expires: VerificationTokenExpires,
    type: 'accountVerification'
  });

}
const verifyUserAccount = async (userId) => {
  // Find the user associated with the token
  const user = await userService.getUserById(userId);

  if (!user) {
    return false;
  }

  // Update the user's email verification status
  user.verified = true;
  await user.save();

  // Optionally, delete the token after verification
  await VerificationToken.deleteOne({ user: userId, type: 'accountVerification' });

  return true;
}

const verifyEmailToken = async (token) => {
  // Verify token validity
  const tokenData = await tokenService.verifyToken(token, 'emailVerificationToken');

  if (!tokenData) {
    return false;
  }

  // Find the user associated with the token
  const user = await userService.getUserById(tokenData.userId);

  if (!user) {
    return false;
  }

  // Update the user's email verification status
  user.emailVerified = true;
  await user.save();

  // Optionally, delete the token after verification
  await VerificationToken.deleteOne({ token })

  return true
};


module.exports = { verifyUserAccount, verifyEmailToken, login, logout, requestPasswordReset, requestUserVerification, verifyPassword }
