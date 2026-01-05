const Order = require('../models/Order');
const DeliveryTracking = require('../models/DeliveryTracking');
const User = require('../models/User');
const { calculateDeliveryEarnings } = require('../utils/helpers');
const logger = require('../utils/logger');

/**
 * Accept delivery order (Delivery only)
 * POST /api/delivery/:orderId/accept
 */
const acceptOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const deliveryBoyId = req.user.userId;

    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Order not found',
          code: 'NOT_FOUND',
          statusCode: 404
        }
      });
    }

    // Check if order is ready
    if (order.status !== 'ready') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Order is not ready for pickup',
          code: 'VALIDATION_ERROR',
          statusCode: 400
        }
      });
    }

    // Check if already assigned
    if (order.deliveryBoyId) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Order already assigned to another delivery person',
          code: 'VALIDATION_ERROR',
          statusCode: 400
        }
      });
    }

    // Assign delivery person
    order.deliveryBoyId = deliveryBoyId;
    order.status = 'picked_up';
    order.statusHistory.push({
      status: 'picked_up',
      timestamp: new Date(),
      updatedBy: deliveryBoyId
    });

    await order.save();

    // Create delivery tracking
    const tracking = new DeliveryTracking({
      orderId: order._id,
      deliveryBoyId,
      startedAt: new Date()
    });

    await tracking.save();

    // Update delivery person availability
    await User.findByIdAndUpdate(deliveryBoyId, { isAvailable: false });

    // Populate order details
    await order.populate('customerId', 'name phone');
    await order.populate('restaurantId', 'name address phone');
    await order.populate('deliveryBoyId', 'name phone vehicle rating');

    logger.info(`Order ${orderId} accepted by delivery person ${deliveryBoyId}`);

    // Socket.IO events handled in socket handler

    res.status(200).json({
      success: true,
      order,
      tracking: {
        _id: tracking._id,
        orderId: tracking.orderId,
        deliveryBoyId: tracking.deliveryBoyId
      }
    });
  } catch (error) {
    logger.error('Accept order error:', error);
    next(error);
  }
};

/**
 * Update delivery location (Delivery only)
 * POST /api/delivery/:orderId/location
 */
const updateLocation = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { latitude, longitude } = req.body;
    const deliveryBoyId = req.user.userId;

    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Order not found',
          code: 'NOT_FOUND',
          statusCode: 404
        }
      });
    }

    // Verify assigned to this delivery person
    if (order.deliveryBoyId.toString() !== deliveryBoyId.toString()) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Not authorized to update location for this order',
          code: 'FORBIDDEN',
          statusCode: 403
        }
      });
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

      // Calculate distance if there's a previous location
      if (tracking.route.length > 1) {
        const { calculateDistance } = require('../utils/helpers');
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

    // Socket.IO events handled in socket handler

    res.status(200).json({
      success: true,
      location: {
        latitude,
        longitude,
        timestamp: new Date()
      }
    });
  } catch (error) {
    logger.error('Update location error:', error);
    next(error);
  }
};

/**
 * Complete delivery (Delivery only)
 * POST /api/delivery/:orderId/complete
 */
const completeDelivery = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { deliveryProof } = req.body;
    const deliveryBoyId = req.user.userId;

    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Order not found',
          code: 'NOT_FOUND',
          statusCode: 404
        }
      });
    }

    // Verify assigned to this delivery person
    if (order.deliveryBoyId.toString() !== deliveryBoyId.toString()) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Not authorized to complete this order',
          code: 'FORBIDDEN',
          statusCode: 403
        }
      });
    }

    // Update order status
    order.status = 'delivered';
    order.actualDeliveryTime = new Date();
    order.statusHistory.push({
      status: 'delivered',
      timestamp: new Date(),
      updatedBy: deliveryBoyId
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
    await User.findByIdAndUpdate(deliveryBoyId, {
      $inc: { totalEarnings: earnings },
      isAvailable: true
    });

    logger.info(`Order ${orderId} completed by delivery person ${deliveryBoyId}`);

    // Socket.IO events handled in socket handler

    res.status(200).json({
      success: true,
      order,
      earnings
    });
  } catch (error) {
    logger.error('Complete delivery error:', error);
    next(error);
  }
};

/**
 * Toggle delivery person online/offline status
 * PATCH /api/delivery/status
 */
const toggleDeliveryStatus = async (req, res, next) => {
  try {
    const { isAvailable } = req.body;
    const deliveryBoyId = req.user.userId;

    await User.findByIdAndUpdate(deliveryBoyId, { isAvailable });

    logger.info(`Delivery person ${deliveryBoyId} set availability to ${isAvailable}`);

    res.status(200).json({
      success: true,
      isAvailable
    });
  } catch (error) {
    logger.error('Toggle delivery status error:', error);
    next(error);
  }
};

module.exports = {
  acceptOrder,
  updateLocation,
  completeDelivery,
  toggleDeliveryStatus
};
