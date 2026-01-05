const twilio = require('twilio');
const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER } = require('../config/env');
const logger = require('../utils/logger');

let twilioClient;

// Initialize Twilio client if credentials are provided
if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) {
  twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
}

/**
 * Send OTP via SMS using Twilio
 * @param {String} phone - Phone number with country code
 * @param {String} otp - 6-digit OTP
 * @returns {Promise<Boolean>} Success status
 */
const sendOTP = async (phone, otp) => {
  try {
    if (!twilioClient) {
      logger.warn('Twilio not configured. OTP:', otp);
      // In development/testing, just log the OTP
      console.log(`\n📱 OTP for ${phone}: ${otp}\n`);
      return true;
    }

    const message = await twilioClient.messages.create({
      body: `Your food delivery verification code is: ${otp}. Valid for 5 minutes.`,
      from: TWILIO_PHONE_NUMBER,
      to: phone
    });

    logger.info(`OTP sent to ${phone}. SID: ${message.sid}`);
    return true;
  } catch (error) {
    logger.error('Twilio error:', error);
    // Don't throw error, fallback to logging
    console.log(`\n📱 OTP for ${phone}: ${otp} (Twilio failed)\n`);
    return true;
  }
};

/**
 * Send SMS notification
 * @param {String} phone - Phone number
 * @param {String} message - Message to send
 * @returns {Promise<Boolean>} Success status
 */
const sendSMS = async (phone, message) => {
  try {
    if (!twilioClient) {
      logger.warn('Twilio not configured. SMS:', message);
      return false;
    }

    const result = await twilioClient.messages.create({
      body: message,
      from: TWILIO_PHONE_NUMBER,
      to: phone
    });

    logger.info(`SMS sent to ${phone}. SID: ${result.sid}`);
    return true;
  } catch (error) {
    logger.error('Twilio SMS error:', error);
    return false;
  }
};

module.exports = {
  sendOTP,
  sendSMS
};
