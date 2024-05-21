## Logger Utility Module Documentation

This document describes the `logger` module, a utility for configuring and creating a Winston logger instance within the boilerplate.

**Purpose:**

- Provides a centralized logging solution for your application.
- Offers different log levels and transports based on the environment (development or production).
- Supports Logtail integration for enhanced logging and monitoring.

**Module Usage:**

1. Import the module in your controllers, services, or other modules requiring logging:

```javascript
const logger = require('../utils/logger');
```

2. Utilize the `logger` object to log messages at different levels (e.g., info, debug, error):

```javascript
logger.info('Application started successfully');
logger.error('An unexpected error occurred');
```

**Configuration:**

- The module utilizes environment variables and a configuration file (`config.js`) for settings.
  - `LOG_PATH`: Path to the directory for storing log files.
  - `LOG_ROTATE_INTERVAL`: (Optional) Number of days or number for the log files to be kept before rotation (used by DailyRotateFile transport).
  - `ENV`: The current environment (e.g., 'DEVELOPMENT' or 'PRODUCTION').
  - `BETTERSTACK_LOG_SOURCE_TOKEN`: Token for Logtail integration. If not provided, Logtail is not used.

**Logging Levels:**

- In development environments, the logger logs messages at the `debug` level, providing detailed information.
- In production environments, the logger logs messages at the `http` level, logging only relevant events and errors.

**Transports:**

- **Common Transports:** (Used in all environments)
  - These transports can be defined based on your needs. Currently, no common transports are defined in the provided code.
- **Development Transports:** (Used only in development environment)
  - **Console Transport:** Logs messages to the console for easy debugging.
- **Production Transports:** (Used only in production environment)
  - **DailyRotateFile Transport:** Rotates log files daily, keeping only a specific number of files as defined in the configuration. Compressed archives are created for rotated logs.
  - **Logtail Transport:** If the `BETTERSTACK_LOG_SOURCE_TOKEN` is provided, logs are sent to Logtail for enhanced logging and monitoring.

**Exception Handling:**

- The logger captures uncaught exceptions and logs them to a separate file named `exceptions.log` in the configured `LOG_PATH`.

**Benefits:**

- Centralized logging simplifies debugging and monitoring application behavior.
- Environment-specific logging levels ensure a balance between detailed information and performance in production.
- Daily log rotation and compression manage log file size and provide historical records.
- Logtail integration allows for advanced log management and monitoring capabilities.


By employing the updated `logger` module, you can achieve consistent and structured logging throughout your application, now with enhanced capabilities through Logtail integration, aiding in development, troubleshooting, and monitoring.