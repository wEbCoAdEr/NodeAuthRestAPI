// Import the Firebase Admin SDK
const firebase = require("firebase-admin");

// Import the configuration settings
const config = require("../config");

// Parse the Firebase service account configuration from the config file
const firebaseAdminConfig = JSON.parse(config.FIREBASE_SERVICE_ACCOUNT_CONFIG);

// Initialize the Firebase app with the service account credentials
firebase.initializeApp({
  credential: firebase.credential.cert(firebaseAdminConfig),
});

// Export the initialized Firebase instance for use in other modules
module.exports = firebase;
