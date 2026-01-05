const logger = require('../utils/logger');
const User = require('../models/User');

/**
 * Handle Socket.IO connection
 * @param {Object} io - Socket.IO instance
 * @param {Object} socket - Socket instance
 */
const handleConnection = async (io, socket) => {
  const { userId, role, restaurantId } = socket.data;

  logger.info(`Client connected: ${userId} (${role})`);

  try {
    // Join user to role-specific room
    if (role === 'customer') {
      socket.join('customers');
    } else if (role === 'owner' && restaurantId) {
      socket.join(`restaurant:${restaurantId}`);
    } else if (role === 'delivery') {
      // Check if delivery person is available
      const user = await User.findById(userId);
      if (user && user.isAvailable) {
        socket.join('delivery:available');
      }
    }

    // Join user to personal room
    socket.join(`user:${userId}`);

    // Emit connection success
    socket.emit('connection:success', {
      userId,
      role,
      message: 'Connected to real-time server'
    });

    logger.info(`Socket ${socket.id} joined rooms for user ${userId}`);
  } catch (error) {
    logger.error('Connection handler error:', error);
    socket.emit('connection:error', {
      message: 'Failed to join rooms'
    });
  }
};

/**
 * Handle Socket.IO disconnection
 * @param {Object} socket - Socket instance
 */
const handleDisconnection = (socket) => {
  const { userId, role } = socket.data;
  logger.info(`Client disconnected: ${userId} (${role})`);

  // Update last seen for delivery persons
  if (role === 'delivery') {
    User.findByIdAndUpdate(userId, {
      lastLogin: new Date()
    }).catch(error => {
      logger.error('Failed to update last seen:', error);
    });
  }
};

module.exports = {
  handleConnection,
  handleDisconnection
};
