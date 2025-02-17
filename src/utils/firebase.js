// Import the Firebase Admin SDK
const firebase = require("firebase-admin");
const logger = require('./logger');

// Import the configuration settings
const config = require("../config");

// Check if the Firebase service account config is available
if (!config.FIREBASE_SERVICE_ACCOUNT_CONFIG) {
  logger.warn("Firebase service account configuration is missing. Firebase initialization skipped.");
  module.exports = null; // Export null to indicate Firebase is not initialized
  return; // Stop further execution
}

try {
  // Parse the Firebase service account configuration from the config file
  const firebaseAdminConfig = JSON.parse(config.FIREBASE_SERVICE_ACCOUNT_CONFIG);

  // Initialize the Firebase app with the service account credentials
  firebase.initializeApp({
    credential: firebase.credential.cert(firebaseAdminConfig),
  });

  // Export the initialized Firebase instance for use in other modules
  module.exports = firebase;
} catch (error) {
  console.error("Error initializing Firebase:", error);
  module.exports = null; // Export null if initialization fails
}