const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { sendOTPController, verifyOTPController } = require('../controllers/authController');
const { validate, schemas } = require('../middleware/validation');

// Rate limiter for OTP endpoints
const otpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 requests per hour per IP
  message: {
    success: false,
    error: {
      message: 'Too many OTP requests. Please try again later.',
      code: 'RATE_LIMIT_EXCEEDED',
      statusCode: 429
    }
  },
  standardHeaders: true,
  legacyHeaders: false
});

// POST /api/auth/send-otp
router.post('/send-otp', otpLimiter, validate(schemas.sendOTP), sendOTPController);

// POST /api/auth/verify-otp
router.post('/verify-otp', validate(schemas.verifyOTP), verifyOTPController);

module.exports = router;
