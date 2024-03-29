/**
 * Utility module for configuring and creating a logger instance using Winston.
 * The logger can write logs to console and file transports based on the environment.
 * @module logger
 */

// Import required dependencies
const winston = require('winston');
require('winston-daily-rotate-file');
const {Console, File, DailyRotateFile} = winston.transports;
const {combine, timestamp, json, errors, colorize, simple, align} = winston.format;
const config = require("../config");

// Define common transports for both development and production environment
const commonTransports = [];

// Define development transports for development environments
const developmentTransports = [
  // Console transport to show logs in the console
  new Console({
    format: combine(colorize(), align(), simple())
  })
];

// Define transports for production environment only
const productionTransports = [
  /*
    DailyRotateFile transport for daily log rotation
    Reference: https://github.com/winstonjs/winston-daily-rotate-file
   */
  new DailyRotateFile({
    dirname: config.LOG_PATH, // Directory for storing log files
    filename: 'application-logs-%DATE%.log',
    maxFiles: config.LOG_ROTATE_INTERVAL, // Maximum number of days or number for the log files to keep
    zippedArchive: true, // Enable compression for rotated log files
  })
];

// Define environment transport based on the application environment
const environmentTransport = config.ENV === 'DEVELOPMENT' ? developmentTransports : productionTransports;

// Combine development and production transports
const loggerTransports = [...commonTransports, ...environmentTransport];

// Create logger instance
const logger = winston.createLogger({
  level: config.ENV === 'DEVELOPMENT' ? 'debug' : 'http', // Set logging level based on environment
  format: combine(errors({stack: true}), timestamp(), json()), // Log format including timestamp and JSON format
  transports: loggerTransports, // Assign transports based on environment
  exceptionHandlers: [
    new File({
      dirname: config.LOG_PATH,
      filename: 'exceptions.log'
    })
  ]
});

// Export the configured logger for use in other modules
module.exports = logger;