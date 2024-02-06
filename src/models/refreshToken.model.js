const mongoose = require('mongoose');

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

// Create the RefreshToken model
const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);

module.exports = RefreshToken;
