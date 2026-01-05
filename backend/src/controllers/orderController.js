const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');
const User = require('../models/User');
const { generateOrderId, calculateDistance, calculateDeliveryFee } = require('../utils/helpers');
const { fetchPayment, initiateRefund } = require('../services/razorpayService');
const logger = require('../utils/logger');

/**
 * Create new order (Customer only)
 * POST /api/orders
 */
const createOrder = async (req, res, next) => {
  try {
    const { restaurantId, items, deliveryAddress, paymentId } = req.body;
    const customerId = req.user.userId;

    // Verify payment
    try {
      const payment = await fetchPayment(paymentId);
      if (payment.status !== 'captured' && payment.status !== 'authorized') {
        return res.status(402).json({
          success: false,
          error: {
            message: 'Payment verification failed',
            code: 'PAYMENT_FAILED',
            statusCode: 402
          }
        });
      }
    } catch (error) {
      logger.error('Payment verification error:', error);
    }

    // Fetch menu items and calculate total
    const menuItemIds = items.map(item => item.menuItemId);
    const menuItems = await MenuItem.find({ _id: { $in: menuItemIds } });

    if (menuItems.length !== items.length) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Some menu items not found',
          code: 'NOT_FOUND',
          statusCode: 404
        }
      });
    }

    // Calculate order items with prices
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
    const restaurant = await Restaurant.findById(restaurantId);
    let deliveryFee = 40; // Default

    if (restaurant && restaurant.address.coordinates && deliveryAddress.coordinates) {
      const distance = calculateDistance(
        restaurant.address.coordinates.latitude,
        restaurant.address.coordinates.longitude,
        deliveryAddress.coordinates.latitude,
        deliveryAddress.coordinates.longitude
      );
      deliveryFee = calculateDeliveryFee(distance);
    }

    // Generate order ID
    const orderId = generateOrderId();

    // Create order
    const order = new Order({
      orderId,
      customerId,
      restaurantId,
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
        updatedBy: customerId
      }]
    });

    await order.save();

    // Populate order details for response
    await order.populate('customerId', 'name phone');
    await order.populate('restaurantId', 'name address phone');

    logger.info(`Order created: ${order.orderId} by customer ${customerId}`);

    // Socket.IO event handled in socket handler

    res.status(201).json({
      success: true,
      order
    });
  } catch (error) {
    logger.error('Create order error:', error);
    next(error);
  }
};

/**
 * Get orders (filtered by role)
 * GET /api/orders
 */
const getOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const { userId, role } = req.user;

    // Build query based on role
    let query = {};

    if (role === 'customer') {
      query.customerId = userId;
    } else if (role === 'owner') {
      // Get owner's restaurant
      const user = await User.findById(userId);
      if (!user.restaurantId) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'No restaurant found for owner',
            code: 'NOT_FOUND',
            statusCode: 404
          }
        });
      }
      query.restaurantId = user.restaurantId;
    } else if (role === 'delivery') {
      // Show assigned orders or available orders (status = ready)
      query.$or = [
        { deliveryBoyId: userId },
        { status: 'ready', deliveryBoyId: null }
      ];
    }

    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('customerId', 'name phone')
      .populate('restaurantId', 'name address phone')
      .populate('deliveryBoyId', 'name phone vehicle rating')
      .lean();

    const totalOrders = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalOrders / limit),
        totalOrders,
        hasMore: skip + orders.length < totalOrders
      }
    });
  } catch (error) {
    logger.error('Get orders error:', error);
    next(error);
  }
};

/**
 * Get single order
 * GET /api/orders/:orderId
 */
const getOrderById = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { userId, role } = req.user;

    const order = await Order.findOne({ orderId })
      .populate('customerId', 'name phone')
      .populate('restaurantId', 'name address phone')
      .populate('deliveryBoyId', 'name phone vehicle rating');

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

    // Verify access
    const hasAccess =
      order.customerId._id.toString() === userId.toString() ||
      (role === 'owner' && order.restaurantId.ownerId && order.restaurantId.ownerId.toString() === userId.toString()) ||
      (order.deliveryBoyId && order.deliveryBoyId._id.toString() === userId.toString());

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Not authorized to view this order',
          code: 'FORBIDDEN',
          statusCode: 403
        }
      });
    }

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    logger.error('Get order error:', error);
    next(error);
  }
};

/**
 * Update order status (Owner or Delivery)
 * PATCH /api/orders/:orderId/status
 */
const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { status, estimatedTime } = req.body;
    const { userId, role } = req.user;

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

    // Validate role permissions
    if (role === 'owner') {
      // Owner can update to: confirmed, preparing, ready, cancelled
      const allowedStatuses = ['confirmed', 'preparing', 'ready', 'cancelled'];
      if (!allowedStatuses.includes(status)) {
        return res.status(403).json({
          success: false,
          error: {
            message: 'Owner cannot set this status',
            code: 'FORBIDDEN',
            statusCode: 403
          }
        });
      }
    } else if (role === 'delivery') {
      // Delivery can update to: picked_up, delivered
      const allowedStatuses = ['picked_up', 'delivered'];
      if (!allowedStatuses.includes(status)) {
        return res.status(403).json({
          success: false,
          error: {
            message: 'Delivery person cannot set this status',
            code: 'FORBIDDEN',
            statusCode: 403
          }
        });
      }
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

    logger.info(`Order ${orderId} status updated to ${status} by ${role}`);

    // Socket.IO events handled in socket handler

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    logger.error('Update order status error:', error);
    next(error);
  }
};

/**
 * Cancel order (Customer or Owner)
 * POST /api/orders/:orderId/cancel
 */
const cancelOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;
    const { userId, role } = req.user;

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

    // Check if can be cancelled
    if (['delivered', 'cancelled'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Order cannot be cancelled',
          code: 'VALIDATION_ERROR',
          statusCode: 400
        }
      });
    }

    // Verify permission
    if (role === 'customer' && order.customerId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Not authorized to cancel this order',
          code: 'FORBIDDEN',
          statusCode: 403
        }
      });
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

    res.status(200).json({
      success: true,
      order,
      refund: refund ? {
        refundId: refund.id,
        status: refund.status || 'initiated',
        amount: order.totalAmount
      } : null
    });
  } catch (error) {
    logger.error('Cancel order error:', error);
    next(error);
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder
};
