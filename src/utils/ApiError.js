/**
 * Utility class for creating API errors with specific status codes and messages.
 * Extends the Error class.
 */
class ApiError extends Error {
  /**
   * Creates an instance of ApiError.
   * @param {number} statusCode - The HTTP status code of the error.
   * @param {string} message - The error message.
   * @param {string} [stack=''] - The stack trace of the error.
   */
  constructor(statusCode, message, stack = '') {
    // Call the constructor of the Error class with the provided message
    super(message);
    // Set the statusCode property of the error instance
    this.statusCode = statusCode;
    // If a stack trace is provided, set the stack property accordingly
    if (stack) {
      this.stack = stack;
    } else {
      // If no stack trace is provided, capture the stack trace
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

// Export the ApiError class to make it available for use in other modules
module.exports = ApiError;
