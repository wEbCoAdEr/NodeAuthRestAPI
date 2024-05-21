## Centralized Error Handling Middleware

This document describes the `errorHandler` middleware module, a utility for handling errors in your Express application in a consistent and informative way.

**Purpose:**

- Provides a centralized approach to error handling, improving code readability and maintainability.
- Ensures a consistent error response format across your API.
- Logs errors for debugging and monitoring purposes.

**Functionality:**

- Catches any errors passed through the Express middleware chain.
- Extracts relevant information from the error object, including status code, message, and stack trace (in development mode only).
- Constructs a structured error response object containing the extracted information.
- Logs the error details using the provided `logger` utility.
- Sends the error response back to the client with an appropriate HTTP status code.

**Usage:**

The `errorHandler` middleware is typically registered at the end of your Express application's middleware stack to capture any unhandled errors. Here's an example of how you might use it in your `app.js` file:

```javascript
const express = require('express');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// ... Your other middleware and routes ...

// Register errorHandler middleware at the end of the middleware stack
app.use(errorHandler);

app.listen(3000, () => console.log('Server listening on port 3000'));
```

**Parameters:**

- `err (Error)`: The error object passed by Express.
- `req (Object)`: The Express request object.
- `res (Object)`: The Express response object.
- `next (Function)`: The callback function to pass control to the next middleware (not used in this implementation).

**Benefits:**

- Improves developer experience by providing a clear structure for handling errors.
- Offers a consistent error response format for easier client-side handling.
- Enhances application stability by logging errors for debugging and monitoring.

**Configuration:**

- The middleware leverages the `logger` utility and `config` module for logging and environment-based behavior. Ensure these dependencies are configured correctly in your application.

By incorporating `errorHandler` in your Express application, you establish a robust error handling mechanism that provides valuable information for both development and production environments.
