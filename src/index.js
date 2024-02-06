// Loads required dependencies
const config = require('./config');
const app = require('./app');
const mongoose = require('mongoose');
const http = require('http');

// Initiate server instance
let server = http.createServer(app);

// Connect to the database
mongoose.connect(config.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {

  console.log("Connected to the database");

  // Start HTTP web server
  server.listen(config.APP_PORT, () => {
    console.log(`Server is listening on port http://127.0.0.1:${config.APP_PORT}`);
  });

}).catch((err) => {
  console.error('Failed to connect to the database', err);
});
