// Import dependencies
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const httpStatus = require('http-status');
const config = require('./config');
const {ApiError, initializeHandlebars, initializeSentry} = require('./utils');
const {rateLimiter, httpLogger, errorConverter, errorHandler} = require('./middlewares');
const router = require('./routes/v1');

// Initiate express app
const app = express();

// Initialize rate limiter
app.use(rateLimiter);

// Initialize and configure view engine
initializeHandlebars(app);

// Initialize Sentry with express app instance
const sentry = initializeSentry(app);

// The request handler middleware of sentry
app.use(sentry.Handlers.requestHandler());

// TracingHandler creates a trace for every incoming request
app.use(sentry.Handlers.tracingHandler());

// HTTP request logger middleware using morgan
app.use(httpLogger);

// Set HTTP security headers
app.use(helmet());

// Apply Cross-Origin Resource Sharing (CORS) middleware
app.use(cors());

// Parse JSON request body
app.use(express.json());

// Parse URL-encoded request body
app.use(express.urlencoded({extended: true}));

// Compress response bodies for all requests
app.use(compression());

// Handle root endpoint request
app.get('/', (req, res) => res.render('home'));

// Serve static files from the "public" directory
app.use(config.STATIC_SERVING_ENDPOINT, express.static('public'));

// Define routers
app.use(config.API_ENPOINT_PREFIX, router);

// Handle not found URLs
app.use((req, res, next) => {
  throw new ApiError(httpStatus.NOT_FOUND, 'Requested URL not found');
});

// Sentry error handler
app.use(sentry.Handlers.errorHandler());

// Convert standard errors to ApiError if necessary
app.use(errorConverter);

// Register the error handling middleware
app.use(errorHandler);

module.exports = app;