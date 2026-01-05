const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');
const logger = require('../utils/logger');

/**
 * Get all menu items for a restaurant
 * GET /api/menu/:restaurantId
 */
const getMenuItems = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;
    const { category, isVeg, available } = req.query;

    // Build query
    const query = { restaurantId };

    if (category) {
      query.category = category;
    }

    if (isVeg !== undefined) {
      query.isVeg = isVeg === 'true';
    }

    if (available !== undefined) {
      query.isAvailable = available === 'true';
    }

    const menuItems = await MenuItem.find(query)
      .sort({ category: 1, name: 1 })
      .lean();

    res.status(200).json({
      success: true,
      menu: menuItems,
      total: menuItems.length
    });
  } catch (error) {
    logger.error('Get menu items error:', error);
    next(error);
  }
};

/**
 * Create new menu item (Owner only)
 * POST /api/menu
 */
const createMenuItem = async (req, res, next) => {
  try {
    const { restaurantId, name, description, price, category, image, isVeg, preparationTime, tags } = req.body;

    // Verify ownership
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Restaurant not found',
          code: 'NOT_FOUND',
          statusCode: 404
        }
      });
    }

    if (restaurant.ownerId.toString() !== req.user.userId.toString()) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Not authorized to add menu items to this restaurant',
          code: 'FORBIDDEN',
          statusCode: 403
        }
      });
    }

    // Create menu item
    const menuItem = new MenuItem({
      restaurantId,
      name,
      description,
      price,
      category,
      image,
      isVeg,
      preparationTime,
      tags
    });

    await menuItem.save();

    logger.info(`Menu item created: ${menuItem._id} by owner ${req.user.userId}`);

    // Socket.IO broadcast handled in socket handler
    res.status(201).json({
      success: true,
      menuItem
    });
  } catch (error) {
    logger.error('Create menu item error:', error);
    next(error);
  }
};

/**
 * Update menu item (Owner only)
 * PUT /api/menu/:menuItemId
 */
const updateMenuItem = async (req, res, next) => {
  try {
    const { menuItemId } = req.params;
    const updates = req.body;

    const menuItem = await MenuItem.findById(menuItemId);
    if (!menuItem) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Menu item not found',
          code: 'NOT_FOUND',
          statusCode: 404
        }
      });
    }

    // Verify ownership
    const restaurant = await Restaurant.findById(menuItem.restaurantId);
    if (restaurant.ownerId.toString() !== req.user.userId.toString()) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Not authorized to update this menu item',
          code: 'FORBIDDEN',
          statusCode: 403
        }
      });
    }

    // Update menu item
    Object.assign(menuItem, updates);
    await menuItem.save();

    logger.info(`Menu item updated: ${menuItem._id}`);

    res.status(200).json({
      success: true,
      menuItem
    });
  } catch (error) {
    logger.error('Update menu item error:', error);
    next(error);
  }
};

/**
 * Delete menu item (soft delete) (Owner only)
 * DELETE /api/menu/:menuItemId
 */
const deleteMenuItem = async (req, res, next) => {
  try {
    const { menuItemId } = req.params;

    const menuItem = await MenuItem.findById(menuItemId);
    if (!menuItem) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Menu item not found',
          code: 'NOT_FOUND',
          statusCode: 404
        }
      });
    }

    // Verify ownership
    const restaurant = await Restaurant.findById(menuItem.restaurantId);
    if (restaurant.ownerId.toString() !== req.user.userId.toString()) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Not authorized to delete this menu item',
          code: 'FORBIDDEN',
          statusCode: 403
        }
      });
    }

    // Soft delete
    menuItem.isAvailable = false;
    await menuItem.save();

    logger.info(`Menu item deleted: ${menuItem._id}`);

    res.status(200).json({
      success: true,
      message: 'Menu item deleted successfully'
    });
  } catch (error) {
    logger.error('Delete menu item error:', error);
    next(error);
  }
};

module.exports = {
  getMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem
};
