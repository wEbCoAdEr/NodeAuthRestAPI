/**
 * Module for loading environment variables from .env file using dotenv and exporting the parsed configuration object.
 * @module config
 */

// Import required dependencies
const dotenv = require('dotenv');

// Load environment variables from .env file and parse them
const config = dotenv.config().parsed;

module.exports = config; // Export the parsed configuration object