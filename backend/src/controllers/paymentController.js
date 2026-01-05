const {
  createOrder: createRazorpayOrder,
  verifyPaymentSignature,
  verifyWebhookSignature,
  RAZORPAY_KEY_ID
} = require('../services/razorpayService');
const Order = require('../models/Order');
const logger = require('../utils/logger');

/**
 * Create Razorpay order
 * POST /api/payment/create-order
 */
const createPaymentOrder = async (req, res, next) => {
  try {
    const { amount, currency = 'INR' } = req.body;

    const order = await createRazorpayOrder(amount, currency);

    res.status(200).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: RAZORPAY_KEY_ID
    });
  } catch (error) {
    logger.error('Create payment order error:', error);
    next(error);
  }
};

/**
 * Verify Razorpay payment
 * POST /api/payment/verify
 */
const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const isValid = verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Payment signature verification failed',
          code: 'PAYMENT_VERIFICATION_FAILED',
          statusCode: 400
        }
      });
    }

    res.status(200).json({
      success: true,
      verified: true,
      paymentId: razorpay_payment_id
    });
  } catch (error) {
    logger.error('Verify payment error:', error);
    next(error);
  }
};

/**
 * Handle Razorpay webhooks
 * POST /api/payment/webhook
 */
const handleWebhook = async (req, res, next) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const body = JSON.stringify(req.body);

    const isValid = verifyWebhookSignature(body, signature);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid webhook signature',
          code: 'INVALID_SIGNATURE',
          statusCode: 400
        }
      });
    }

    const event = req.body.event;
    const payload = req.body.payload.payment || req.body.payload.refund;

    logger.info(`Webhook received: ${event}`);

    // Handle different events
    switch (event) {
      case 'payment.captured':
        // Payment successful
        await Order.updateOne(
          { paymentId: payload.entity.id },
          { paymentStatus: 'success' }
        );
        break;

      case 'payment.failed':
        // Payment failed
        await Order.updateOne(
          { paymentId: payload.entity.id },
          { paymentStatus: 'failed' }
        );
        break;

      case 'refund.processed':
        // Refund completed
        await Order.updateOne(
          { refundId: payload.entity.id },
          { paymentStatus: 'refunded' }
        );
        break;

      default:
        logger.info(`Unhandled webhook event: ${event}`);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    logger.error('Webhook error:', error);
    next(error);
  }
};

module.exports = {
  createPaymentOrder,
  verifyPayment,
  handleWebhook
};
