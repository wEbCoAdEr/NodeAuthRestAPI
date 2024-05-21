## Error Conversion Middleware

This document explains the `errorConverter` middleware module, a utility for ensuring consistent error handling in your Express application.

**Purpose:**

- Standardizes error responses by converting non-`ApiError` instances into `ApiError` objects.
- Promotes consistent error handling throughout your application by using the `ApiError` class for all API errors.

**Functionality:**

- Catches any errors passed through the Express middleware chain.
- Checks if the error is an instance of the custom `ApiError` class.
- If the error is not an `ApiError`:
    - Extracts the status code and message from the existing error, or uses defaults.
    - Creates a new `ApiError` instance using the extracted information and the original error's stack trace.
- Passes the (potentially converted) `ApiError` object to the next middleware in the chain for further processing (typically the `errorHandler`).

**Benefits:**

- Enforces consistent error handling by ensuring all errors use the designated format (`ApiError`).
- Simplifies error handling in downstream middleware by providing a unified error object structure.
- Improves error logging and debugging by preserving the original error's stack trace within the new `ApiError` instance.

**Usage:**

The `errorConverter` middleware is typically placed near the beginning of your Express application's middleware stack to capture errors before they reach the `errorHandler`. Here's an example of how you might use it:

```javascript
const express = require('express');
const errorConverter = require('./middlewares/errorConverter');
const errorHandler = require('./middlewares/errorHandler'); // Assumes errorHandler exists

const app = express();

// Register errorConverter middleware early in the middleware chain
app.use(errorConverter);

// ... Your other middleware and routes ...

// Register errorHandler middleware at the end of the middleware stack
app.use(errorHandler);

app.listen(3000, () => console.log('Server listening on port 3000'));
```

**Parameters:**

- `err (Error)`: The error object passed by Express.
- `req (Object)`: The Express request object.
- `res (Object)`: The Express response object.
- `next (Function)`: The callback function to pass control to the next middleware.

**Configuration:**

This middleware relies on the existence of the custom `ApiError` class (defined elsewhere in your application) to provide a consistent error format.

By incorporating `errorConverter` in your Express application, you ensure a standardized approach to error handling, simplifying development and enhancing the maintainability of your codebase.