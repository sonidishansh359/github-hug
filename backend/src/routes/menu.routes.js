const express = require('express');
const router = express.Router();
const {
  getMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem
} = require('../controllers/menuController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

// GET /api/menu/:restaurantId - Public route
router.get('/:restaurantId', getMenuItems);

// POST /api/menu - Owner only
router.post(
  '/',
  authenticate,
  authorize('owner'),
  validate(schemas.createMenuItem),
  createMenuItem
);

// PUT /api/menu/:menuItemId - Owner only
router.put(
  '/:menuItemId',
  authenticate,
  authorize('owner'),
  validate(schemas.updateMenuItem),
  updateMenuItem
);

// DELETE /api/menu/:menuItemId - Owner only
router.delete(
  '/:menuItemId',
  authenticate,
  authorize('owner'),
  deleteMenuItem
);

module.exports = router;
