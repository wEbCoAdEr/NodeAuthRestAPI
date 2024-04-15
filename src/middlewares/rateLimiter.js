const rateLimit = require('express-rate-limit');
const config = require('../config');

const rateLimiter = rateLimit({
  windowMs: Number(config.RATE_LIMIT_TTL) * 1000,
  limit: config.RATE_LIMIT_MAX,
  standardHeaders: 'draft-7',
  message: config.RATE_LIMIT_MESSAGE
});

module.exports = rateLimiter;