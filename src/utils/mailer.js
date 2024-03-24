/**
 * Module for handling email sending functionality using Nodemailer.
 * @module mailer
 */

// Import required dependencies
const nodemailer = require('nodemailer');
const nodemailerHandlebars = require('nodemailer-express-handlebars');
const path = require('path');
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

// Attach the nodemailerHandlebars to the nodemailer transporter
transporter.use('compile', nodemailerHandlebars({
  viewEngine: {
    extname: '.hbs',
    defaultLayout: false,
    partialsDir: path.join(__dirname, '../views/emails'),
  },
  viewPath: path.join(__dirname, '../views/emails'),
  extName: '.hbs'
}));

/**
 * Sends an email using the configured Nodemailer transporter.
 * @param {Object} mailConfig - Configuration for sending the email.
 * @param {string} [mailConfig.fromName=config.SMTP_FROM] - Name of the sender.
 * @param {string} [mailConfig.fromAddress=config.SMTP_USER] - Email address of the sender.
 * @param {string[]} mailConfig.toList - Array of recipient email addresses.
 * @param {string} mailConfig.subject - Subject of the email.
 * @param {string} mailConfig.template - Name of the Handlebars template for the email content.
 * @param {Object} mailConfig.templateData - Data to be passed to the Handlebars template.
 * @returns {Promise<Object|boolean>} A promise that resolves to the email information if successful, or false if there was an error.
 */
const send = async (mailConfig) => {

  // Extract email send configuration
  const {
    fromName = config.SMTP_FROM, fromAddress = config.SMTP_USER,
    toList, subject, template, templateData
  } = mailConfig;

  const from = `${fromName} <${fromAddress}>`;
  const to = toList.join(',');

  try {
    // Send email using Nodemailer transporter
    const info = await transporter.sendMail({
      from, to, subject, template, context: templateData
    });
    logger.info(`Email sent: ${info.messageId}`);
    return info;

  } catch (err) {
    logger.error('Error sending email: ', err);
    return false;
  }
}

// Export transporter and send function
module.exports = {transporter, send};
