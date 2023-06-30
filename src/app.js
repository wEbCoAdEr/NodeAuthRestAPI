// Import dependencies
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { errorHandler } = require('./middlewares');

// Import routers
const authRouter = require('./routes/auth.route');

// Initiate express app
const app = express();

// Set HTTP security headers
app.use(helmet());

// Apply Cross-Origin Resource Sharing (CORS) middleware
app.use(cors());

// Parse JSON request body
app.use(express.json());

// Define routers
app.use('/auth', authRouter);

// Register the error handling middleware
app.use(errorHandler);

module.exports = app;