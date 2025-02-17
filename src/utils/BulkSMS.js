const axios = require('axios');
const config = require('../config');
const logger = require('./logger');

const formatPhoneNumber = (phoneNumber) => {
    // Check if the phone number starts with +880 and remove it
    if (phoneNumber.startsWith('+880')) {
        phoneNumber = phoneNumber.slice(4);
    }

    // Ensure the phone number starts with 0
    if (!phoneNumber.startsWith('0')) {
        phoneNumber = '0' + phoneNumber;
    }

    return phoneNumber;
}

const sendSMS = async (data) => {
    const url = config.SMS_PROVIDER_HOST;
    const { number, message } = data;

    const formattedNumber = formatPhoneNumber(number);

    const body = {
        api_key: config.SMS_API_KEY,
        senderid: config.SMS_SENDER_ID,
        number: formattedNumber,
        message: message
    };

    const options = {
        headers: {
            'Content-Type': 'application/json',
        }
    };

    try {
        const response = await axios.post(url, body, options);

        if (response.status !== 200) {
            logger.error('Error sending SMS: ', response.statusText);
            return false;
        }

        const responseData = response.data;
        logger.info(`Message sent: ${JSON.stringify(responseData)}`);
        return responseData;
    } catch (error) {
        logger.error('Error sending SMS: ', error);
        return false;
    }
}

module.exports = sendSMS;
