/**
 * Module for configuring and creating HTTP request logging middleware using Morgan.
 * This middleware logs HTTP requests to the console and uses the logger utility for writing logs.
 * @module httpLogger
 */

// Import required dependencies
const morgan = require('morgan');
const { logger } = require('../utils');

// Configure the HTTP request logging middleware using morgan
const httpLogger = morgan(
  'combined', { // Use the 'combined' format for logging
    stream: {
      // Define a custom write function that trims the message and logs it using the logger's 'http' method
      write: message => logger.http(message.trim())
    }
  }
);

// Export the configured httpLogger middleware for use in other modules
module.exports = httpLogger;
