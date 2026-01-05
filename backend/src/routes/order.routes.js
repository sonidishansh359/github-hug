const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder
} = require('../controllers/orderController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

// POST /api/orders - Customer only
router.post(
  '/',
  authenticate,
  authorize('customer'),
  validate(schemas.createOrder),
  createOrder
);

// GET /api/orders - All authenticated users
router.get(
  '/',
  authenticate,
  getOrders
);

// GET /api/orders/:orderId - All authenticated users
router.get(
  '/:orderId',
  authenticate,
  getOrderById
);

// PATCH /api/orders/:orderId/status - Owner or Delivery
router.patch(
  '/:orderId/status',
  authenticate,
  authorize('owner', 'delivery'),
  validate(schemas.updateOrderStatus),
  updateOrderStatus
);

// POST /api/orders/:orderId/cancel - Customer or Owner
router.post(
  '/:orderId/cancel',
  authenticate,
  authorize('customer', 'owner'),
  validate(schemas.cancelOrder),
  cancelOrder
);

module.exports = router;
