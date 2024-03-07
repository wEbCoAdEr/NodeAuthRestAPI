/**
 * Utility module for sending emails using Nodemailer.
 * This module provides functionality to configure a transporter with SMTP options
 * and send emails with specified content and recipients.
 * @module email
 */
const nodemailer = require('nodemailer');
const config = require('../config');
const {logger} = require('../utils');

// Create transporter with configured options
const transporter = nodemailer.createTransport({
  host: config.SMTP_HOST,
  port: config.SMTP_PORT,
  secure: config.SMTP_PORT == 465 ? true : false,
  auth: {
    user: config.SMTP_USER,
    pass: config.SMTP_PASS
  }
});

/**
 * Send email using Nodemailer transporter.
 * @param {Object} mailConfig - Email configuration object.
 * @param {string} mailConfig.fromName - Sender's name.
 * @param {string} mailConfig.fromAddress - Sender's email address.
 * @param {string[]} mailConfig.toList - Array of recipient email addresses.
 * @param {string} mailConfig.subject - Email subject.
 * @param {string} mailConfig.bodyType - Type of email body (e.g., 'text' or 'html').
 * @param {string} mailConfig.body - Email body content.
 * @returns {Promise} - Promise resolving to the sent email object.
 */
const send = async (mailConfig) => {

  // Extract email send configuration
  const {fromName, fromAddress, toList, subject, bodyType, body} = mailConfig;
  const from = `${fromName} <${fromAddress}>`;
  const to = toList.join(',');

  // Send email using Nodemailer transporter
  const mail = await transporter.sendMail({
    from, to, subject, [bodyType]: body
  });

  logger.info(`Email sent: ${mail.messageId}`);
  return mail;
}

module.exports = { transporter, send };