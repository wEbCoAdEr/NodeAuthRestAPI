/**
 * Module for defining the Refresh Token schema and creating the RefreshToken model.
 * @module refreshTokenModel
 */

// Load required dependencies
const mongoose = require('mongoose');
const {paginate} = require("./plugins");

// Define the Refresh Token schema
const refreshTokenSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  token: {
    type: String,
    required: true,
    index: true
  },
  ip: {
    type: String,
    required: true
  },
  expires: {
    type: Date, // Store expiration time as a Date object
    required: true
  }
}, { timestamps: true });

// Add paginate plugin
refreshTokenSchema.plugin(paginate);

// Create the RefreshToken model
const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);

module.exports = RefreshToken; // Export the RefreshToken model