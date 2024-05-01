## Token Authentication Middleware Module Documentation

This document describes the `authToken` middleware module, a utility for securing Express routes that require user authentication.

**Purpose:**

- Enforces authentication on routes by verifying the presence and validity of an access token provided in the request header.
- Offers a centralized approach to access token validation and simplifies authentication logic within your application.

**Functionality:**

- Verifies access tokens based on the specified token type (default: `passwordResetToken`).
- Leverages helper functions from `authHelper` for token extraction and basic validation.
- Utilizes the `tokenService` to perform in-depth token verification using the appropriate service logic.

**Usage:**

1. Import the `authToken` middleware from the module:

```javascript
const { authToken } = require('../middlewares');
```

2. Apply the `authToken` middleware to your protected routes:

```javascript
router.get('/protected/data', authToken(), async (req, res) => {
    const userData = req.tokenObject; // Access user data from decoded token (if applicable)
    // Your route handler logic here
    res.json({ message: 'Access granted!' });
});
```

**Parameters:**

- `tokenType` (optional): The type of token to be verified (defaults to `passwordResetToken`).
- `callback` (optional): A function to be invoked after successful token verification. This function receives the decoded token object and the request object as arguments.

**Benefits:**

- Enhances application security by restricting access to authorized users.
- Promotes code maintainability by centralizing authentication logic in a reusable middleware function.
- Provides flexibility for handling different token types through the optional `tokenType` parameter.

**Example:**

The provided code snippet showcases how to use `authToken` in a route that requires authentication. Upon successful token verification, the decoded token object (if applicable) can be accessed within the route handler using `req.tokenObject`.

By incorporating `authToken` in your Express application, you can streamline authentication and safeguard access to sensitive resources within your API.
