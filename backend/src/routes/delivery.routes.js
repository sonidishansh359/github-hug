const express = require('express');
const router = express.Router();
const {
  acceptOrder,
  updateLocation,
  completeDelivery,
  toggleDeliveryStatus
} = require('../controllers/deliveryController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

// POST /api/delivery/:orderId/accept - Delivery only
router.post(
  '/:orderId/accept',
  authenticate,
  authorize('delivery'),
  acceptOrder
);

// POST /api/delivery/:orderId/location - Delivery only
router.post(
  '/:orderId/location',
  authenticate,
  authorize('delivery'),
  validate(schemas.updateLocation),
  updateLocation
);

// POST /api/delivery/:orderId/complete - Delivery only
router.post(
  '/:orderId/complete',
  authenticate,
  authorize('delivery'),
  validate(schemas.completeDelivery),
  completeDelivery
);

// PATCH /api/delivery/status - Delivery only
router.patch(
  '/status',
  authenticate,
  authorize('delivery'),
  validate(schemas.updateDeliveryStatus),
  toggleDeliveryStatus
);

module.exports = router;
