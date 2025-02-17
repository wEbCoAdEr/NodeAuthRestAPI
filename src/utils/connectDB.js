const mongoose = require('mongoose'); // Import mongoose for MongoDB object modeling
const config = require('../config'); // Import the configuration file to get the database URI
const logger = require('./logger'); // Import the logger utility for logging information and errors

/**
 * Connect to the MongoDB database.
 * @async
 * @function connectDB
 * @returns {Promise<void>}
 */
const connectDB = async () => {
  try {
    // Attempt to connect to the database using the URI from the configuration file
    await mongoose.connect(config.DB_URI, {
      useNewUrlParser: true, // Use the new URL parser
      useUnifiedTopology: true // Use the new server discovery and monitoring engine
    });
    logger.info("Connected to MongoDB Database"); // Log a message indicating successful connection
  } catch (err) {
    logger.error(err); // Log any errors that occur during the connection attempt
  }
}

module.exports = connectDB; // Export the connectDB function for use in other parts of the application
