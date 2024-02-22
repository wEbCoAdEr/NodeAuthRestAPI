// Loads required dependencies
const mongoose = require('mongoose');
const http = require('http');
const config = require('./config');
const app = require('./app');
const { logger } = require('./utils');

// Initiate server instance
let server = http.createServer(app);

// Connect to the database
mongoose.connect(config.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {

  logger.info("Connected to MongoDB Database");

  // Start HTTP web server
  server.listen(config.APP_PORT, () => {
    logger.info(`Server is listening on http://127.0.0.1:${config.APP_PORT}`);
  });

}).catch((error) => {
  logger.error(error);
});
