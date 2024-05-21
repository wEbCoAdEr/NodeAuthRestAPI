## Rate Limiting Middleware Module Documentation

This document describes the `rateLimiter` middleware module, a utility for implementing rate limiting in your Express application.

**Purpose:**

- Protects your API from excessive requests by limiting the number of requests an IP address can make within a defined time window.
- Enhances application stability and security by preventing denial-of-service attacks.

**Functionality:**

- Leverages the `express-rate-limit` package to track and limit incoming API requests.
- Retrieves configuration values (rate limit window, maximum allowed requests, etc.) from the environment variables stored in the `config` module.
- Configures the middleware based on these values to enforce rate limits.
- When a rate limit is exceeded, the middleware sends a custom error response (defined in the configuration) to the client.

**Configuration:**

- The middleware relies on environment variables (e.g., `RATE_LIMIT_TTL`, `RATE_LIMIT_MAX`, `RATE_LIMIT_MESSAGE`) to define its behavior.
- You'll need to set these environment variables appropriately for your application's requirements.

**Benefits:**

- Safeguards your API against malicious or abusive usage patterns.
- Promotes fair access to API resources by preventing a single user or IP from overwhelming the server.
- Improves application performance and scalability by limiting excessive requests.

**Usage:**

1. Install the `express-rate-limit` package:

   ```bash
   npm install express-rate-limit
   ```

2. Configure the required environment variables in your `.env` file or process management tool.

3. Import and use the `rateLimiter` middleware in your Express application:

   ```javascript
   const express = require('express');
   const rateLimiter = require('./middlewares/rateLimiter');

   const app = express();

   // Apply rateLimiter middleware to protect specific routes or the entire application
   app.use(rateLimiter);  // Apply globally

   // ... Your other middleware and routes ...

   app.listen(3000, () => console.log('Server listening on port 3000'));
   ```

**Reference:**

- For more details on configuration options and advanced usage, refer to the `express-rate-limit` package documentation: [https://www.npmjs.com/package/express-rate-limit](https://www.npmjs.com/package/express-rate-limit)

By incorporating `rateLimiter` in your Express application, you establish a robust defense mechanism against excessive requests, safeguarding your API's stability and performance.