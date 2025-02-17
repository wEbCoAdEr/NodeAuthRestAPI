/**
 * FCM Service
 * This module handles sending notifications via Firebase Cloud Messaging (FCM) to users.
 */

const httpStatus = require("http-status");
const { FcmToken } = require("../models");
const {logger, ApiError, firebase} = require("../utils");


/**
 * Save FCM Token
 * Saves a user's FCM registration token in the database.
 *
 * @param {string} userId - The ID of the user for whom to save the FCM token.
 * @param {string} registrationToken - The FCM registration token to be saved.
 * @returns {Promise<boolean>} A promise that resolves to true if the token was saved successfully, or false otherwise.
 */
const saveFCMToken = async (userId, registrationToken) => {
  try {
    // Find the user's FCM tokens from the database
    let tokensRecord = await FcmToken.findOne({ user: userId });

    // If no record exists, create a new one
    if (!tokensRecord) {
      tokensRecord = new FcmToken({ user: userId, tokens: [] });
    }

    // Check if the token is already saved
    if (!tokensRecord.tokens.includes(registrationToken)) {
      // Add the new token to the tokens array
      tokensRecord.tokens.push(registrationToken);
      await tokensRecord.save();
    } else {
      const conflictMessage = `FCM token already exists for user ${userId}`;
      throw new ApiError(httpStatus.CONFLICT, conflictMessage);
    }
    return tokensRecord;
  } catch (error) {
    logger.error("Error saving FCM token:", error);
    throw error;
  }
};

/**
 * Get Tokens By User ID
 * Fetches the FCM tokens associated with a user from the database.
 *
 * @param {string} userId - The ID of the user for whom to fetch FCM tokens.
 * @returns {Array<string> | false} An array of FCM tokens for the user, or false if no tokens are found.
 */
const getTokensByUserId = async (userId) => {
  try {
    // Find the user's FCM tokens from the database
    const tokensRecord = await FcmToken.findOne({ user: userId });

    // Check if FCM tokens are found for the user
    if (
      !tokensRecord ||
      !tokensRecord.tokens ||
      tokensRecord.tokens.length === 0
    ) {
      // No FCM tokens found for the user, return false
      return false;
    }

    // Return the recipient FCM tokens
    return tokensRecord.tokens;
  } catch (error) {
    // Handle errors gracefully and log them
    logger.error(`Error fetching FCM tokens for user ${userId}: ${error}`);
    return false;
  }
};

/**
 * Logs the delivery status of notifications.
 *
 * @param {object} response - The response object from sending notifications.
 * @param {number} response.failureCount - The count of failed deliveries.
 * @param {number} response.successCount - The count of successful deliveries.
 */
const logMessageDeliveryStatus = (response) => {
  if (response.failureCount > 0) {
    logger.warn(
      `Failed to send notifications to ${response.failureCount} devices`
    );
  }
  logger.info(`Notifications sent to ${response.successCount} devices`);
};

/**
 * Send Notification
 *
 * Sends notifications to a user with the specified custom data.
 *
 * @param {string} userId - The user's ID to send notifications to.
 * @param {string} title - The title of the notification.
 * @param {string} content - The content/body of the notification.
 * @param {Object} customData - Custom data to include in the notification.
 * @returns {Promise<boolean>} A promise that resolves to `true` if notifications are sent successfully,
 *                            or `false` if there's an error during the notification sending process.
 * @throws {Error} If there's a critical error during the notification sending process, this function may throw an error.
 */
const sendNotification = async (userId, title, content, customData) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Delete inactive tokens before sending notifications
      await deleteInactiveTokens(userId);

      // Get the recipient FCM tokens
      const recipientTokens = await getTokensByUserId(userId);

      if (!recipientTokens) {
        // No tokens found for the user, handle accordingly
        logger.warn(`No FCM tokens found for user ${userId}`);
        resolve(false);
        return;
      }

      // Prepare the notification message payload with custom data
      const notificationMessagePayload = {
        tokens: recipientTokens,
        notification: {
          title: title,
          body: content,
        },
        data: customData, // Include custom data here
      };

      // Prepare the data message payload with custom data
      const dataMessagePayload = {
        tokens: recipientTokens,
        data: customData,
      };

      await Promise.all([
        // Send data message to multiple devices using sendMulticast method
        firebase.messaging().sendEachForMulticast(dataMessagePayload),
        // Send notifications message to multiple devices using sendMulticast method
        firebase.messaging().sendEachForMulticast(notificationMessagePayload),
      ]);

      resolve(true);
    } catch (error) {
      // Handle any errors that occur during the notification sending process
      logger.error("Error sending notifications:", error);
      resolve(false); // Resolve to false if there's an error
    }
  });
};

/**
 * Check Token Validity
 * Sends a test notification to a token and checks if it is valid and active.
 *
 * @param {string} token - The FCM registration token to test.
 * @returns {Promise<boolean>} A promise that resolves to true if the token is valid and active, or false otherwise.
 */
const checkToken = async (token) => {
  const message = {
    data: {
      operation: "Token Test",
    },
    token: token,
  };

  try {
    // Send a test message to the token and resolve to true if successful
    await firebase.messaging().send(message);
    return true;
  } catch (error) {
    if (error.code === "messaging/invalid-registration-token") {
      logger.error("Invalid token:", error);
      return false;
    }
    logger.error("FCM Service checkToken error: ", error);
  }
};

/**
 * Delete Inactive Tokens
 * Deletes inactive tokens from the user's FCM tokens record in the database.
 *
 * @param {string} userId - The ID of the user for whom to delete inactive tokens.
 * @returns {Promise<boolean>} A promise that resolves to true if the operation was successful, or false otherwise.
 */
const deleteInactiveTokens = async (userId) => {
  try {
    const recipientTokens = await getTokensByUserId(userId);

    if (!recipientTokens) {
      // No tokens found for the user, nothing to delete
      return true;
    }

    const activeTokens = await Promise.all(
      recipientTokens.map((token) => checkToken(token))
    );

    const activeRecipientTokens = recipientTokens.filter(
      (token, index) => activeTokens[index]
    );

    const tokensRecord = await FcmToken.findOne({ user: userId });
    if (tokensRecord) {
      tokensRecord.tokens = activeRecipientTokens;
      await tokensRecord.save();
    }

    return true;
  } catch (error) {
    logger.error("Error deleting inactive tokens:", error);
    return false;
  }
};

module.exports = {
  saveFCMToken,
  sendNotification,
};
