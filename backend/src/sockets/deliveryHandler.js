const Order = require('../models/Order');
const DeliveryTracking = require('../models/DeliveryTracking');
const User = require('../models/User');
const { calculateDeliveryEarnings, calculateDistance } = require('../utils/helpers');
const logger = require('../utils/logger');

/**
 * Handle delivery-related Socket.IO events
 * @param {Object} io - Socket.IO instance
 * @param {Object} socket - Socket instance
 */
const registerDeliveryHandlers = (io, socket) => {
  const { userId, role } = socket.data;

  /**
   * Event: delivery:accept
   * Delivery person accepts an order
   */
  socket.on('delivery:accept', async (payload) => {
    try {
      if (role !== 'delivery') {
        socket.emit('delivery:accept:error', {
          message: 'Only delivery persons can accept orders',
          code: 'FORBIDDEN'
        });
        return;
      }

      const { orderId } = payload;

      const order = await Order.findOne({ orderId });
      if (!order) {
        socket.emit('delivery:accept:error', {
          message: 'Order not found',
          code: 'NOT_FOUND'
        });
        return;
      }

      // Check if order is ready
      if (order.status !== 'ready') {
        socket.emit('delivery:accept:error', {
          message: 'Order is not ready for pickup',
          code: 'VALIDATION_ERROR'
        });
        return;
      }

      // Check if already assigned
      if (order.deliveryBoyId) {
        socket.emit('delivery:accept:error', {
          message: 'Order already assigned',
          code: 'VALIDATION_ERROR'
        });
        return;
      }

      // Assign delivery person
      order.deliveryBoyId = userId;
      order.status = 'picked_up';
      order.statusHistory.push({
        status: 'picked_up',
        timestamp: new Date(),
        updatedBy: userId
      });

      await order.save();

      // Create delivery tracking
      const tracking = new DeliveryTracking({
        orderId: order._id,
        deliveryBoyId: userId,
        startedAt: new Date()
      });

      await tracking.save();

      // Update delivery person availability
      await User.findByIdAndUpdate(userId, { isAvailable: false });

      // Leave available room
      socket.leave('delivery:available');

      // Populate order details
      await order.populate('customerId', 'name phone');
      await order.populate('restaurantId', 'name address phone');
      await order.populate('deliveryBoyId', 'name phone vehicle rating');

      logger.info(`Order ${orderId} accepted by delivery person ${userId}`);

      // Notify customer
      io.to(`user:${order.customerId}`).emit('delivery:assigned', {
        orderId,
        deliveryBoy: {
          id: order.deliveryBoyId._id,
          name: order.deliveryBoyId.name,
          phone: order.deliveryBoyId.phone,
          vehicle: order.deliveryBoyId.vehicle,
          rating: order.deliveryBoyId.rating
        },
        status: 'picked_up'
      });

      // Notify owner
      io.to(`restaurant:${order.restaurantId._id}`).emit('delivery:assigned', {
        orderId,
        deliveryBoy: {
          id: order.deliveryBoyId._id,
          name: order.deliveryBoyId.name,
          phone: order.deliveryBoyId.phone,
          vehicle: order.deliveryBoyId.vehicle
        }
      });

      // Confirm to delivery person
      socket.emit('delivery:accept:success', {
        order
      });
    } catch (error) {
      logger.error('delivery:accept error:', error);
      socket.emit('delivery:accept:error', {
        message: error.message || 'Failed to accept order',
        code: 'INTERNAL_ERROR'
      });
    }
  });

  /**
   * Event: delivery:reject
   * Delivery person rejects an order
   */
  socket.on('delivery:reject', async (payload) => {
    try {
      if (role !== 'delivery') {
        return;
      }

      const { orderId, reason } = payload;

      logger.info(`Order ${orderId} rejected by delivery person ${userId}. Reason: ${reason}`);

      // Just log the rejection, order remains available for other delivery persons
      socket.emit('delivery:reject:success', {
        orderId
      });
    } catch (error) {
      logger.error('delivery:reject error:', error);
    }
  });

  /**
   * Event: location:update
   * Delivery person updates their location
   */
  socket.on('location:update', async (payload) => {
    try {
      if (role !== 'delivery') {
        socket.emit('location:update:error', {
          message: 'Only delivery persons can update location',
          code: 'FORBIDDEN'
        });
        return;
      }

      const { orderId, location } = payload;
      const { latitude, longitude } = location;

      const order = await Order.findOne({ orderId });
      if (!order) {
        socket.emit('location:update:error', {
          message: 'Order not found',
          code: 'NOT_FOUND'
        });
        return;
      }

      // Verify assigned to this delivery person
      if (order.deliveryBoyId.toString() !== userId.toString()) {
        socket.emit('location:update:error', {
          message: 'Not authorized',
          code: 'FORBIDDEN'
        });
        return;
      }

      // Update tracking
      const tracking = await DeliveryTracking.findOne({ orderId: order._id });
      if (tracking) {
        tracking.route.push({
          latitude,
          longitude,
          timestamp: new Date()
        });

        tracking.currentLocation = {
          latitude,
          longitude,
          lastUpdated: new Date()
        };

        // Calculate distance
        if (tracking.route.length > 1) {
          const prevLocation = tracking.route[tracking.route.length - 2];
          const distance = calculateDistance(
            prevLocation.latitude,
            prevLocation.longitude,
            latitude,
            longitude
          );
          tracking.distanceCovered += distance;
        }

        await tracking.save();
      }

      logger.info(`Location updated for order ${orderId}`);

      // Broadcast to customer and owner
      io.to(`user:${order.customerId}`).emit('delivery:location:updated', {
        orderId,
        deliveryBoy: {
          id: userId,
          location: { latitude, longitude }
        },
        timestamp: new Date()
      });

      io.to(`restaurant:${order.restaurantId}`).emit('delivery:location:updated', {
        orderId,
        deliveryBoy: {
          id: userId,
          location: { latitude, longitude }
        },
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('location:update error:', error);
      socket.emit('location:update:error', {
        message: error.message || 'Failed to update location',
        code: 'INTERNAL_ERROR'
      });
    }
  });

  /**
   * Event: delivery:complete
   * Delivery person completes delivery
   */
  socket.on('delivery:complete', async (payload) => {
    try {
      if (role !== 'delivery') {
        socket.emit('delivery:complete:error', {
          message: 'Only delivery persons can complete delivery',
          code: 'FORBIDDEN'
        });
        return;
      }

      const { orderId, deliveredAt } = payload;

      const order = await Order.findOne({ orderId });
      if (!order) {
        socket.emit('delivery:complete:error', {
          message: 'Order not found',
          code: 'NOT_FOUND'
        });
        return;
      }

      // Verify assigned to this delivery person
      if (order.deliveryBoyId.toString() !== userId.toString()) {
        socket.emit('delivery:complete:error', {
          message: 'Not authorized',
          code: 'FORBIDDEN'
        });
        return;
      }

      // Update order
      order.status = 'delivered';
      order.actualDeliveryTime = new Date();
      order.statusHistory.push({
        status: 'delivered',
        timestamp: new Date(),
        updatedBy: userId
      });

      await order.save();

      // Update tracking
      await DeliveryTracking.findOneAndUpdate(
        { orderId: order._id },
        { completedAt: new Date() }
      );

      // Calculate earnings
      const earnings = calculateDeliveryEarnings(order.totalAmount);

      // Update delivery person
      await User.findByIdAndUpdate(userId, {
        $inc: { totalEarnings: earnings },
        isAvailable: true
      });

      // Rejoin available room
      socket.join('delivery:available');

      logger.info(`Order ${orderId} completed by delivery person ${userId}`);

      // Notify customer and owner
      io.to(`user:${order.customerId}`).emit('order:delivered', {
        orderId,
        status: 'delivered',
        deliveredAt: new Date()
      });

      io.to(`restaurant:${order.restaurantId}`).emit('order:delivered', {
        orderId,
        status: 'delivered',
        deliveredAt: new Date()
      });

      // Confirm to delivery person
      socket.emit('delivery:complete:success', {
        orderId,
        earnings
      });
    } catch (error) {
      logger.error('delivery:complete error:', error);
      socket.emit('delivery:complete:error', {
        message: error.message || 'Failed to complete delivery',
        code: 'INTERNAL_ERROR'
      });
    }
  });
};

module.exports = registerDeliveryHandlers;
