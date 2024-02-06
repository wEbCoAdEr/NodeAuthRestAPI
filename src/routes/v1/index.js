const express = require("express");

// Create router
const router = express.Router();

// Define routes
const routes = [
    {
        path: "/auth",
        handler: require("./auth.route")
    }
];

// Add each route to the router
routes.forEach((route) => {
    router.use(route.path, route.handler);
});

module.exports = router;