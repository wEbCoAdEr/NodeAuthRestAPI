## Authorization Middleware Module Documentation

This document describes the `authUser` middleware module, a utility for enforcing authorization on Express routes based on user roles.

**Purpose:**

- Extends basic authentication by verifying a user's access token and ensuring they have the required role to access a specific route.
- Provides a centralized approach to user authorization within your application.

**Functionality:**

- Verifies access tokens similar to the `authToken` middleware.
- Additionally checks if the user's role (extracted from the decoded token) is included in the list of allowed roles specified for the route.
- Attaches relevant user information (e.g., user ID, role) to the request object for easy access within route handlers.

**Usage:**

1. Import the `authUser` middleware from the module:

```javascript
const { authUser } = require('../middlewares');
```

2. Apply the `authUser` middleware to routes requiring specific user roles:

```javascript
const allowedRoles = ['admin', 'editor'];

router.put('/protected/data', authUser(allowedRoles), async (req, res) => {
    const userId = req.userId; // Access user ID from request object
    // Your route handler logic here
    res.json({ message: 'Data updated successfully!' });
});
```

**Parameters:**

- `allowedRoles` (optional): An array of strings representing the allowed user roles for accessing the route. An empty array (`[]`) allows access to any authenticated user.

**Benefits:**

- Enhances access control by restricting routes based on user roles.
- Simplifies authorization logic by centralizing role verification in a reusable middleware function.
- Offers flexibility in defining allowed roles for each route.

**Example:**

The provided code snippet showcases how to use `authUser` to restrict access to a route based on specific roles. The middleware first verifies the access token and then checks if the user's role from the decoded token matches any of the allowed roles defined for the route. Only authorized users can proceed to the route handler logic.

By incorporating `authUser` in your Express application, you can implement role-based authorization and ensure that only users with the appropriate permissions can access sensitive resources.
