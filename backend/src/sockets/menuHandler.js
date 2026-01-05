const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');
const logger = require('../utils/logger');

/**
 * Handle menu-related Socket.IO events
 * @param {Object} io - Socket.IO instance
 * @param {Object} socket - Socket instance
 */
const registerMenuHandlers = (io, socket) => {
  const { userId, role } = socket.data;

  /**
   * Event: menu:item:add
   * Owner adds a new menu item
   */
  socket.on('menu:item:add', async (payload) => {
    try {
      if (role !== 'owner') {
        socket.emit('menu:item:add:error', {
          message: 'Only owners can add menu items',
          code: 'FORBIDDEN'
        });
        return;
      }

      const { restaurantId, name, description, price, category, image, isVeg, preparationTime } = payload;

      // Verify ownership
      const restaurant = await Restaurant.findById(restaurantId);
      if (!restaurant || restaurant.ownerId.toString() !== userId.toString()) {
        socket.emit('menu:item:add:error', {
          message: 'Not authorized to add items to this restaurant',
          code: 'FORBIDDEN'
        });
        return;
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
        preparationTime
      });

      await menuItem.save();

      logger.info(`Menu item added via socket: ${menuItem._id}`);

      // Broadcast to all customers
      io.to('customers').emit('menu:item:added', {
        menuItem
      });

      // Confirm to owner
      socket.emit('menu:item:add:success', {
        menuItem
      });
    } catch (error) {
      logger.error('menu:item:add error:', error);
      socket.emit('menu:item:add:error', {
        message: error.message || 'Failed to add menu item',
        code: 'INTERNAL_ERROR'
      });
    }
  });

  /**
   * Event: menu:item:update
   * Owner updates a menu item
   */
  socket.on('menu:item:update', async (payload) => {
    try {
      if (role !== 'owner') {
        socket.emit('menu:item:update:error', {
          message: 'Only owners can update menu items',
          code: 'FORBIDDEN'
        });
        return;
      }

      const { menuItemId, updates } = payload;

      const menuItem = await MenuItem.findById(menuItemId);
      if (!menuItem) {
        socket.emit('menu:item:update:error', {
          message: 'Menu item not found',
          code: 'NOT_FOUND'
        });
        return;
      }

      // Verify ownership
      const restaurant = await Restaurant.findById(menuItem.restaurantId);
      if (!restaurant || restaurant.ownerId.toString() !== userId.toString()) {
        socket.emit('menu:item:update:error', {
          message: 'Not authorized to update this menu item',
          code: 'FORBIDDEN'
        });
        return;
      }

      // Update menu item
      Object.assign(menuItem, updates);
      await menuItem.save();

      logger.info(`Menu item updated via socket: ${menuItem._id}`);

      // Broadcast to all customers
      io.to('customers').emit('menu:item:updated', {
        menuItem
      });

      // Confirm to owner
      socket.emit('menu:item:update:success', {
        menuItem
      });
    } catch (error) {
      logger.error('menu:item:update error:', error);
      socket.emit('menu:item:update:error', {
        message: error.message || 'Failed to update menu item',
        code: 'INTERNAL_ERROR'
      });
    }
  });

  /**
   * Event: menu:item:delete
   * Owner deletes a menu item (soft delete)
   */
  socket.on('menu:item:delete', async (payload) => {
    try {
      if (role !== 'owner') {
        socket.emit('menu:item:delete:error', {
          message: 'Only owners can delete menu items',
          code: 'FORBIDDEN'
        });
        return;
      }

      const { menuItemId } = payload;

      const menuItem = await MenuItem.findById(menuItemId);
      if (!menuItem) {
        socket.emit('menu:item:delete:error', {
          message: 'Menu item not found',
          code: 'NOT_FOUND'
        });
        return;
      }

      // Verify ownership
      const restaurant = await Restaurant.findById(menuItem.restaurantId);
      if (!restaurant || restaurant.ownerId.toString() !== userId.toString()) {
        socket.emit('menu:item:delete:error', {
          message: 'Not authorized to delete this menu item',
          code: 'FORBIDDEN'
        });
        return;
      }

      // Soft delete
      menuItem.isAvailable = false;
      await menuItem.save();

      logger.info(`Menu item deleted via socket: ${menuItem._id}`);

      // Broadcast to all customers
      io.to('customers').emit('menu:item:deleted', {
        menuItemId
      });

      // Confirm to owner
      socket.emit('menu:item:delete:success', {
        menuItemId
      });
    } catch (error) {
      logger.error('menu:item:delete error:', error);
      socket.emit('menu:item:delete:error', {
        message: error.message || 'Failed to delete menu item',
        code: 'INTERNAL_ERROR'
      });
    }
  });
};

module.exports = registerMenuHandlers;
