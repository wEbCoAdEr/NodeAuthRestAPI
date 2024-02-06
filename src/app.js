// Import dependencies
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const config = require('./config');
const { errorHandler } = require('./middlewares');
const router = require('./routes/v1');

// Initiate express app
const app = express();

// Set HTTP security headers
app.use(helmet());

// Apply Cross-Origin Resource Sharing (CORS) middleware
app.use(cors());

// Parse JSON request body
app.use(express.json());

// Parse URL-encoded request body
app.use(express.urlencoded({ extended: true }));

// Compress response bodies for all requests
app.use(compression());

// Define routers
app.use(config.API_ENPOINT_PREFIX, router);

// Register the error handling middleware
app.use(errorHandler);

module.exports = app;