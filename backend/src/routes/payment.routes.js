const express = require('express');
const router = express.Router();
const {
  createPaymentOrder,
  verifyPayment,
  handleWebhook
} = require('../controllers/paymentController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

// POST /api/payment/create-order - Customer only
router.post(
  '/create-order',
  authenticate,
  authorize('customer'),
  validate(schemas.createPaymentOrder),
  createPaymentOrder
);

// POST /api/payment/verify - Customer only
router.post(
  '/verify',
  authenticate,
  validate(schemas.verifyPayment),
  verifyPayment
);

// POST /api/payment/webhook - Public (verified by signature)
router.post('/webhook', handleWebhook);

module.exports = router;
