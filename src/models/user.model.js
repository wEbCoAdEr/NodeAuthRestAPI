// Load required dependencies
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config');

// Define user schema
const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
    },
    role: {
        type: String,
        enum: ['user', 'admin'], // User role can be 'user' or 'admin'
        default: 'user' // Default role is 'user'
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true, transform: (_, ret) => { delete ret._id; } }
});

// Hash user password before saving to the database
userSchema.pre('save', async function (next) {
    const user = this;
    if (user.isModified('password')) {
        try {
            const salt = bcrypt.genSaltSync(Number(config.HASH_SALT_ROUND));
            user.password = bcrypt.hashSync(user.password, salt);
        } catch (error) {
            next(error);  // Pass any errors to the next middleware
        }
    }
    next(); // Continue to the next middleware
});

// Initiate User model
const User = mongoose.model("User", userSchema);

module.exports = User;
