// Import required classes from the 'agora-token' package
const { RtcTokenBuilder, RtcRole } = require('agora-token');

// Import configuration settings from the config file
const config = require('../config');

/**
 * Generates an RTC access token for Agora.
 *
 * @param {string} channelName - The unique channel name for the AgoraRTC session.
 *                               The string length must be less than 64 bytes.
 * @param {number} uid - The user ID.
 * @param {string} [userRole='publisher'] - The role of the user. It can be either 'publisher' or 'subscriber'.
 *                                          - 'publisher' for a voice/video call or a live broadcast.
 *                                          - 'subscriber' if your live-broadcast scenario requires authentication for Hosting-in.
 * @returns {string} - The generated RTC token.
 */
const generateAccessToken = async (channelName, account, userRole = 'publisher') => {
  // Parse the token expiration time from the config file
  const expirationTimeInSeconds = Number(config.AGORA_ACCESS_TOKEN_EXPIRATION);

  // Determine the user's role
  const role = userRole === 'publisher' ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;

  // Generate and return the RTC token
  return RtcTokenBuilder.buildTokenWithUserAccount(
    config.AGORA_APP_ID,          // The Agora App ID
    config.AGORA_APP_CERTIFICATE, // The Agora App Certificate
    channelName,                  // The unique channel name
    account,                      // The user ID
    role,                         // The user role (publisher or subscriber)
    expirationTimeInSeconds,      // The token expiration time in seconds
    expirationTimeInSeconds       // The privilege expiration time in seconds
  );
};

// Export the generateAccessToken function for use in other parts of the application
module.exports = {
  generateAccessToken
};
