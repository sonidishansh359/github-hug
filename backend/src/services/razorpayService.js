const Razorpay = require('razorpay');
const crypto = require('crypto');
const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET } = require('../config/env');
const logger = require('../utils/logger');

let razorpayInstance;

// Initialize Razorpay if credentials are provided
if (RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET) {
  razorpayInstance = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET
  });
}

/**
 * Create Razorpay order
 * @param {Number} amount - Amount in rupees
 * @param {String} currency - Currency code (default INR)
 * @param {Object} notes - Additional notes
 * @returns {Promise<Object>} Razorpay order object
 */
const createOrder = async (amount, currency = 'INR', notes = {}) => {
  try {
    if (!razorpayInstance) {
      logger.warn('Razorpay not configured');
      // Return mock order for testing
      return {
        id: `order_mock_${Date.now()}`,
        amount: amount * 100,
        currency,
        status: 'created'
      };
    }

    const options = {
      amount: amount * 100, // Convert to paise
      currency,
      receipt: `receipt_${Date.now()}`,
      notes
    };

    const order = await razorpayInstance.orders.create(options);
    logger.info('Razorpay order created:', order.id);
    return order;
  } catch (error) {
    logger.error('Razorpay create order error:', error);
    throw new Error('Failed to create payment order');
  }
};

/**
 * Verify Razorpay payment signature
 * @param {String} orderId - Razorpay order ID
 * @param {String} paymentId - Razorpay payment ID
 * @param {String} signature - Razorpay signature
 * @returns {Boolean} Is signature valid
 */
const verifyPaymentSignature = (orderId, paymentId, signature) => {
  try {
    if (!RAZORPAY_KEY_SECRET) {
      logger.warn('Razorpay secret not configured, skipping verification');
      return true; // Skip verification in development
    }

    const text = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');

    const isValid = expectedSignature === signature;
    logger.info('Payment signature verification:', isValid);
    return isValid;
  } catch (error) {
    logger.error('Payment verification error:', error);
    return false;
  }
};

/**
 * Verify webhook signature
 * @param {String} body - Webhook request body
 * @param {String} signature - X-Razorpay-Signature header
 * @returns {Boolean} Is signature valid
 */
const verifyWebhookSignature = (body, signature) => {
  try {
    if (!RAZORPAY_WEBHOOK_SECRET) {
      logger.warn('Razorpay webhook secret not configured');
      return true;
    }

    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest('hex');

    return expectedSignature === signature;
  } catch (error) {
    logger.error('Webhook verification error:', error);
    return false;
  }
};

/**
 * Fetch payment details
 * @param {String} paymentId - Razorpay payment ID
 * @returns {Promise<Object>} Payment details
 */
const fetchPayment = async (paymentId) => {
  try {
    if (!razorpayInstance) {
      logger.warn('Razorpay not configured');
      return {
        id: paymentId,
        status: 'captured',
        amount: 50000
      };
    }

    const payment = await razorpayInstance.payments.fetch(paymentId);
    return payment;
  } catch (error) {
    logger.error('Fetch payment error:', error);
    throw new Error('Failed to fetch payment details');
  }
};

/**
 * Initiate refund
 * @param {String} paymentId - Razorpay payment ID
 * @param {Number} amount - Amount to refund in rupees (optional, full refund if not provided)
 * @returns {Promise<Object>} Refund object
 */
const initiateRefund = async (paymentId, amount = null) => {
  try {
    if (!razorpayInstance) {
      logger.warn('Razorpay not configured');
      return {
        id: `rfnd_mock_${Date.now()}`,
        status: 'processed',
        amount: amount ? amount * 100 : 50000
      };
    }

    const options = amount ? { amount: amount * 100 } : {};
    const refund = await razorpayInstance.payments.refund(paymentId, options);
    logger.info('Refund initiated:', refund.id);
    return refund;
  } catch (error) {
    logger.error('Refund error:', error);
    throw new Error('Failed to initiate refund');
  }
};

module.exports = {
  createOrder,
  verifyPaymentSignature,
  verifyWebhookSignature,
  fetchPayment,
  initiateRefund,
  RAZORPAY_KEY_ID
};
