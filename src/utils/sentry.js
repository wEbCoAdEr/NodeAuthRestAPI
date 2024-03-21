/**
 * Module for initializing Sentry error tracking.
 * @module sentry
 */

// Import dependencies
const sentry = require("@sentry/node");
const config = require("../config");

/**
 * Initialize Sentry error tracking with the provided Express app instance.
 * @param {Object} app - The Express app instance.
 * @returns {Object} The initialized Sentry instance.
 */
const initializeSentry = (app) => {
  // Initialize Sentry with configuration options
  sentry.init({
    dsn: config.SENTRY_DSN, // Sentry DSN for error reporting
    integrations: [
      // Enable HTTP calls tracing
      new sentry.Integrations.Http({tracing: true}),
      // Enable Express.js middleware tracing
      new sentry.Integrations.Express({app}),
    ],
    // Configure performance monitoring
    tracesSampleRate: 1.0, // Capture 100% of the transactions
    // Set sampling rate for profiling (relative to tracesSampleRate)
    profilesSampleRate: 1.0,
  });

  // Return the initialized Sentry instance
  return sentry;
};

// Export the initializeSentry function
module.exports = initializeSentry;
