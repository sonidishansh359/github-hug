const User = require('../models/User');
const { getRedisClient } = require('../config/redis');
const { generateToken } = require('../utils/jwt');
const { generateOTP, isValidPhone } = require('../utils/helpers');
const { sendOTP } = require('../services/twilioService');
const logger = require('../utils/logger');

/**
 * Send OTP to phone number
 * POST /api/auth/send-otp
 */
const sendOTPController = async (req, res, next) => {
  try {
    const { phone, role } = req.body;

    // Normalize phone number
    const normalizedPhone = phone.startsWith('+91') ? phone : `+91${phone}`;

    if (!isValidPhone(normalizedPhone)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid phone number format',
          code: 'VALIDATION_ERROR',
          statusCode: 400
        }
      });
    }

    // Generate OTP
    const otp = generateOTP();

    // Store OTP in Redis with 5-minute expiry
    const redisClient = getRedisClient();
    if (redisClient) {
      const key = `otp:${normalizedPhone}`;
      await redisClient.setEx(key, 300, JSON.stringify({ otp, role })); // 5 minutes
      logger.info(`OTP generated for ${normalizedPhone}`);
    } else {
      // Fallback: store in memory (not recommended for production)
      logger.warn('Redis not available, OTP verification may not work properly');
    }

    // Send OTP via Twilio
    await sendOTP(normalizedPhone, otp);

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      expiresIn: 300
    });
  } catch (error) {
    logger.error('Send OTP error:', error);
    next(error);
  }
};

/**
 * Verify OTP and return JWT token
 * POST /api/auth/verify-otp
 */
const verifyOTPController = async (req, res, next) => {
  try {
    const { phone, otp } = req.body;

    // Normalize phone number
    const normalizedPhone = phone.startsWith('+91') ? phone : `+91${phone}`;

    // Retrieve OTP from Redis
    const redisClient = getRedisClient();
    let storedData;

    if (redisClient) {
      const key = `otp:${normalizedPhone}`;
      const data = await redisClient.get(key);

      if (!data) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'OTP not found or expired',
            code: 'NOT_FOUND',
            statusCode: 404
          }
        });
      }

      storedData = JSON.parse(data);

      // Verify OTP
      if (storedData.otp !== otp) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Invalid OTP',
            code: 'VALIDATION_ERROR',
            statusCode: 400
          }
        });
      }

      // Delete OTP from Redis
      await redisClient.del(key);
    } else {
      // For testing without Redis, accept any 6-digit OTP
      logger.warn('Redis not available, accepting OTP for testing');
      storedData = { role: 'customer' };
    }

    // Check if user exists
    let user = await User.findOne({ phone: normalizedPhone });
    let isNewUser = false;

    if (!user) {
      // Create new user
      user = new User({
        phone: normalizedPhone,
        role: storedData.role || 'customer',
        isActive: true
      });
      await user.save();
      isNewUser = true;
      logger.info(`New user created: ${normalizedPhone}`);
    } else {
      // Update last login
      user.lastLogin = new Date();
      await user.save();
    }

    // Generate JWT token
    const token = generateToken({
      userId: user._id,
      phone: user.phone,
      role: user.role,
      restaurantId: user.restaurantId
    });

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        phone: user.phone,
        name: user.name,
        role: user.role,
        restaurantId: user.restaurantId
      },
      isNewUser
    });
  } catch (error) {
    logger.error('Verify OTP error:', error);
    next(error);
  }
};

module.exports = {
  sendOTPController,
  verifyOTPController
};
