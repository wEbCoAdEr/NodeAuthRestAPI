## HTTP Request Logging Middleware Module Documentation

This document describes the `httpLogger` module, a utility for configuring and utilizing Morgan to log HTTP requests in your Express application.

**Purpose:**

- Provides a centralized solution for logging HTTP requests to the console and potentially other destinations.
- Simplifies request logging setup by leveraging the popular Morgan library.

**Functionality:**

- Imports and configures the `morgan` middleware with the desired logging format ('combined' in this case).
- Defines a custom write stream for Morgan that:
    - Trims any leading or trailing whitespace from the log message for cleaner output.
    - Utilizes the provided `logger` utility (assumed to have an `http` method) to log the request details.

**Benefits:**

- Offers a convenient way to capture and analyze HTTP request data.
- Provides a structured logging format for efficient log analysis.
- Promotes code maintainability by centralizing HTTP request logging configuration.

**Usage:**

The `httpLogger` module exports the pre-configured Morgan middleware, ready to be included in your Express application's middleware stack. Here's an example of how you might use it:

```javascript
const express = require('express');
const httpLogger = require('./middlewares/httpLogger');

const app = express();

// Register httpLogger middleware early in the middleware chain for request logging
app.use(httpLogger);

// ... Your other middleware and routes ...

app.listen(3000, () => console.log('Server listening on port 3000'));
```

**Configuration:**

- This implementation assumes the existence of a `logger` utility with an `http` method for logging purposes. You'll need to configure that utility to define where and how the logs are stored.
- The `morgan` middleware offers various pre-defined logging formats. You can adjust the configuration within the `httpLogger` module to use a different format if needed.

By incorporating `httpLogger` in your Express application, you gain a simple yet valuable tool for monitoring and understanding HTTP request traffic.
