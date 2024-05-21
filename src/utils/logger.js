/**
 * Utility module for configuring and creating a logger instance using Winston.
 * The logger can write logs to console and file transports based on the environment.
 * @module logger
 */

// Import required dependencies
const winston = require('winston');
require('winston-daily-rotate-file');
const { Console, File, DailyRotateFile } = winston.transports;
const { combine, timestamp, json, errors, colorize, simple, align } = winston.format;
const { Logtail } = require("@logtail/node");
const { LogtailTransport } = require("@logtail/winston");
const config = require("../config");

// Define common transports for both development and production environment
// (Currently empty - could be used for shared transports like an audit log)
const commonTransports = [];

// Create a Logtail client with conditional check for environment variable
const logtail = config.BETTERSTACK_LOG_SOURCE_TOKEN ?
  new Logtail(config.BETTERSTACK_LOG_SOURCE_TOKEN)
  : null;

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
  }),
  ...(logtail ? [new LogtailTransport(logtail)] : []) // Include Logtail only if token is provided
];

// Define environment transport based on the application environment
const environmentTransport = config.ENV === 'DEVELOPMENT' ? developmentTransports : productionTransports;

// Combine development and production transports
const loggerTransports = [...commonTransports, ...environmentTransport];

// Create logger instance
const logger = winston.createLogger({
  level: config.ENV === 'DEVELOPMENT' ? 'debug' : 'http', // Set logging level based on environment
  format: combine(errors({ stack: true }), timestamp(), json()), // Log format including timestamp and JSON format
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
