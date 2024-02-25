// Loads required dependencies
const mongoose = require('mongoose');
const config = require('./config');
const app = require('./app');
const {logger} = require('./utils');

// Initiate server variable
let server;

// Connect to the database
mongoose.connect(config.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {

  logger.info("Connected to MongoDB Database");

  // Start HTTP web server
  server = app.listen(config.APP_PORT, () => {
    logger.info(`Server is listening on http://127.0.0.1:${config.APP_PORT} | Process ID: ${process.pid}`);
  });
});

/**
 * Terminate the application process gracefully with logging and exit code
 * @function
 * @param {string} reason - Reason for termination
 * @param {string} [signal=''] - Termination signal
 * @param {number} [exitCode=0] - Exit code for termination
 * @returns {void}
 */
const terminateProcess = (reason, signal = '', exitCode = 0) => {
  const message = reason === 'command' ? `Received ${signal} signal!` : 'An unexpected error occurred!';
  logger.info(`${message} Shutting down the application...`);

  if (server) {
    server.close(() => logger.info('Application server closed'));
  }

  logger.info('Application shutdown process completed successfully');
  process.exit(exitCode);
}

/**
 * Handle unexpected errors gracefully
 * @function
 * @param {Error} error - The unexpected error
 * @returns {void}
 */
const handleUnexpectedError = (error) => {
  logger.error('An unexpected error occurred:', error);
  terminateProcess('error', '', 1); // Use specific exit code for errors
}

// Register unexpected error event handlers
process.on('uncaughtException', handleUnexpectedError);
process.on('unhandledRejection', handleUnexpectedError);

// Graceful termination handler on SIGTERM signal
process.on('SIGTERM', () => {
  terminateProcess('command', 'SIGTERM');
});

// Forceful termination handler on SIGINT signal
process.on('SIGINT', () => {
  terminateProcess('command', 'SIGINT');
});

