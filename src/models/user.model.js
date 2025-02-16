// Load required dependencies
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config');
const {paginate} = require("./plugins");
const {coreHelper} = require("../helpers");

// Define user schema
const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  username: {
    type: String,
    unique: true
  },
  email: {
    type: String,
    unique: true,
  },
  contact_number: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
  date_of_birth: {
    type: Date,
    required: true,
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true,
  },
  role: {
    type: String,
    enum: ['patient', 'doctor', 'admin'], // User role can be 'patient', 'doctor' or 'admin'
    default: 'patient' // Default role is 'patient'
  },
  verified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true, transform: (_, ret) => {
      delete ret._id;
    }
  }
});



// Hash user password before saving to the database
userSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    try {
      user.password = coreHelper.hashString(user.password);
    } catch (error) {
      next(error);  // Pass any errors to the next middleware
    }
  }
  next(); // Continue to the next middleware
});

// Add paginate plugin
userSchema.plugin(paginate);

// Initiate User model
const User = mongoose.model("User", userSchema);

module.exports = User;
