const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');
const { generateOrderId, calculateDistance, calculateDeliveryFee } = require('../utils/helpers');
const { fetchPayment, initiateRefund } = require('../services/razorpayService');
const logger = require('../utils/logger');

/**
 * Handle order-related Socket.IO events
 * @param {Object} io - Socket.IO instance
 * @param {Object} socket - Socket instance
 */
const registerOrderHandlers = (io, socket) => {
  const { userId, role, restaurantId } = socket.data;

  /**
   * Event: order:place
   * Customer places an order
   */
  socket.on('order:place', async (payload) => {
    try {
      if (role !== 'customer') {
        socket.emit('order:place:error', {
          message: 'Only customers can place orders',
          code: 'FORBIDDEN'
        });
        return;
      }

      const { restaurantId: orderRestaurantId, items, deliveryAddress, paymentId, paymentStatus } = payload;

      // Verify payment
      try {
        const payment = await fetchPayment(paymentId);
        if (payment.status !== 'captured' && payment.status !== 'authorized') {
          socket.emit('order:place:error', {
            message: 'Payment verification failed',
            code: 'PAYMENT_FAILED'
          });
          return;
        }
      } catch (error) {
        logger.error('Payment verification error:', error);
      }

      // Fetch menu items
      const menuItemIds = items.map(item => item.menuItemId);
      const menuItems = await MenuItem.find({ _id: { $in: menuItemIds } });

      if (menuItems.length !== items.length) {
        socket.emit('order:place:error', {
          message: 'Some menu items not found',
          code: 'NOT_FOUND'
        });
        return;
      }

      // Calculate order items
      const orderItems = items.map(item => {
        const menuItem = menuItems.find(mi => mi._id.toString() === item.menuItemId);
        return {
          menuItemId: menuItem._id,
          name: menuItem.name,
          quantity: item.quantity,
          price: menuItem.price,
          subtotal: menuItem.price * item.quantity
        };
      });

      const totalAmount = orderItems.reduce((sum, item) => sum + item.subtotal, 0);

      // Calculate delivery fee
      const restaurant = await Restaurant.findById(orderRestaurantId);
      let deliveryFee = 40;

      if (restaurant && restaurant.address.coordinates && deliveryAddress.coordinates) {
        const distance = calculateDistance(
          restaurant.address.coordinates.latitude,
          restaurant.address.coordinates.longitude,
          deliveryAddress.coordinates.latitude,
          deliveryAddress.coordinates.longitude
        );
        deliveryFee = calculateDeliveryFee(distance);
      }

      // Create order
      const orderId = generateOrderId();
      const order = new Order({
        orderId,
        customerId: userId,
        restaurantId: orderRestaurantId,
        items: orderItems,
        totalAmount,
        deliveryAddress,
        deliveryFee,
        paymentId,
        paymentStatus: 'success',
        status: 'confirmed',
        estimatedDeliveryTime: 45,
        statusHistory: [{
          status: 'confirmed',
          timestamp: new Date(),
          updatedBy: userId
        }]
      });

      await order.save();
      await order.populate('customerId', 'name phone');
      await order.populate('restaurantId', 'name address phone');

      logger.info(`Order placed via socket: ${order.orderId}`);

      // Emit to restaurant owner
      io.to(`restaurant:${orderRestaurantId}`).emit('order:new', {
        order
      });

      // Confirm to customer
      socket.emit('order:placed:success', {
        order
      });
    } catch (error) {
      logger.error('order:place error:', error);
      socket.emit('order:place:error', {
        message: error.message || 'Failed to place order',
        code: 'INTERNAL_ERROR'
      });
    }
  });

  /**
   * Event: order:status:change
   * Owner changes order status
   */
  socket.on('order:status:change', async (payload) => {
    try {
      if (role !== 'owner' && role !== 'delivery') {
        socket.emit('order:status:change:error', {
          message: 'Only owner or delivery can change order status',
          code: 'FORBIDDEN'
        });
        return;
      }

      const { orderId, status, estimatedTime } = payload;

      const order = await Order.findOne({ orderId });
      if (!order) {
        socket.emit('order:status:change:error', {
          message: 'Order not found',
          code: 'NOT_FOUND'
        });
        return;
      }

      // Update order
      order.status = status;
      if (estimatedTime) {
        order.estimatedDeliveryTime = estimatedTime;
      }
      if (status === 'delivered') {
        order.actualDeliveryTime = new Date();
      }

      order.statusHistory.push({
        status,
        timestamp: new Date(),
        updatedBy: userId
      });

      await order.save();

      logger.info(`Order ${orderId} status changed to ${status}`);

      // Emit to customer
      io.to(`user:${order.customerId}`).emit('order:status:updated', {
        orderId,
        status,
        estimatedTime,
        updatedAt: new Date()
      });

      // If status is 'ready', notify all available delivery persons
      if (status === 'ready') {
        await order.populate('restaurantId', 'name address phone');
        io.to('delivery:available').emit('order:ready', {
          order: {
            _id: order._id,
            orderId: order.orderId,
            restaurantName: order.restaurantId.name,
            restaurantAddress: order.restaurantId.address,
            deliveryAddress: order.deliveryAddress,
            totalAmount: order.totalAmount,
            items: order.items,
            estimatedEarning: Math.max(order.totalAmount * 0.1, 50)
          }
        });
      }

      // If picked_up or delivered, notify owner
      if (['picked_up', 'delivered'].includes(status)) {
        io.to(`restaurant:${order.restaurantId}`).emit('order:status:updated', {
          orderId,
          status,
          updatedAt: new Date()
        });
      }

      // Confirm to sender
      socket.emit('order:status:change:success', {
        orderId,
        status
      });
    } catch (error) {
      logger.error('order:status:change error:', error);
      socket.emit('order:status:change:error', {
        message: error.message || 'Failed to change order status',
        code: 'INTERNAL_ERROR'
      });
    }
  });

  /**
   * Event: order:cancel
   * Customer or Owner cancels order
   */
  socket.on('order:cancel', async (payload) => {
    try {
      if (role !== 'customer' && role !== 'owner') {
        socket.emit('order:cancel:error', {
          message: 'Only customer or owner can cancel orders',
          code: 'FORBIDDEN'
        });
        return;
      }

      const { orderId, reason } = payload;

      const order = await Order.findOne({ orderId });
      if (!order) {
        socket.emit('order:cancel:error', {
          message: 'Order not found',
          code: 'NOT_FOUND'
        });
        return;
      }

      // Check if can be cancelled
      if (['delivered', 'cancelled'].includes(order.status)) {
        socket.emit('order:cancel:error', {
          message: 'Order cannot be cancelled',
          code: 'VALIDATION_ERROR'
        });
        return;
      }

      // Update order
      order.status = 'cancelled';
      order.cancellationReason = reason;
      order.cancelledBy = role;
      order.statusHistory.push({
        status: 'cancelled',
        timestamp: new Date(),
        updatedBy: userId
      });

      // Initiate refund
      let refund = null;
      if (order.paymentId && order.paymentStatus === 'success') {
        try {
          refund = await initiateRefund(order.paymentId);
          order.paymentStatus = 'refunded';
          order.refundId = refund.id;
        } catch (error) {
          logger.error('Refund error:', error);
        }
      }

      await order.save();

      logger.info(`Order ${orderId} cancelled by ${role}`);

      // Broadcast to all parties
      io.to(`user:${order.customerId}`).emit('order:cancelled', {
        orderId,
        status: 'cancelled',
        reason,
        cancelledBy: role,
        refundStatus: refund ? 'initiated' : null,
        refundId: refund ? refund.id : null
      });

      io.to(`restaurant:${order.restaurantId}`).emit('order:cancelled', {
        orderId,
        status: 'cancelled',
        reason,
        cancelledBy: role
      });

      if (order.deliveryBoyId) {
        io.to(`user:${order.deliveryBoyId}`).emit('order:cancelled', {
          orderId,
          status: 'cancelled',
          reason,
          cancelledBy: role
        });
      }

      socket.emit('order:cancel:success', {
        orderId,
        refundId: refund ? refund.id : null
      });
    } catch (error) {
      logger.error('order:cancel error:', error);
      socket.emit('order:cancel:error', {
        message: error.message || 'Failed to cancel order',
        code: 'INTERNAL_ERROR'
      });
    }
  });
};

module.exports = registerOrderHandlers;
