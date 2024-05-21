const rateLimit = require('express-rate-limit');
const config = require('../config');

/**
 * Rate limiting middleware for Express applications.
 *
 * This middleware utilizes the `express-rate-limit` package to limit the rate of requests to your API endpoints.
 * Configuration is based on values defined in the environment variables stored in the `config` module.
 *
 * @see {@link https://www.npmjs.com/package/express-rate-limit} for more details on the `express-rate-limit` package.
 */
const rateLimiter = rateLimit({
  /**
   * The time window (in milliseconds) for tracking API requests.
   * This value is retrieved from the `RATE_LIMIT_TTL` environment variable and multiplied by 1000 for conversion to milliseconds.
   */
  windowMs: Number(config.RATE_LIMIT_TTL) * 1000,
  /**
   * The maximum allowed number of requests within the specified time window.
   * This value is retrieved from the `RATE_LIMIT_MAX` environment variable.
   */
  limit: config.RATE_LIMIT_MAX,
  /**
   * Defines the format for rate limiting headers added to the response.
   * Set to 'draft-7' for compatibility with the IETF draft standard.
   */
  standardHeaders: 'draft-7',
  /**
   * The message to be sent in the response when a rate limit is exceeded.
   * This value is retrieved from the `RATE_LIMIT_MESSAGE` environment variable.
   */
  message: config.RATE_LIMIT_MESSAGE
});

module.exports = rateLimiter;
