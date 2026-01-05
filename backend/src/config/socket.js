const socketIO = require('socket.io');
const { FRONTEND_URL } = require('./env');
const { verifyToken } = require('../utils/jwt');
const logger = require('../utils/logger');

let io;

/**
 * Initialize Socket.IO server
 * @param {Object} server - HTTP server instance
 * @returns {Object} Socket.IO instance
 */
const initializeSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: FRONTEND_URL,
      credentials: true,
      methods: ['GET', 'POST']
    },
    transports: ['websocket', 'polling']
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication token required'));
      }

      // Verify token
      const decoded = verifyToken(token);

      // Attach user data to socket
      socket.data.userId = decoded.userId;
      socket.data.phone = decoded.phone;
      socket.data.role = decoded.role;
      socket.data.restaurantId = decoded.restaurantId;

      logger.info(`Socket authenticated: ${decoded.userId} (${decoded.role})`);
      next();
    } catch (error) {
      logger.error('Socket authentication error:', error);
      next(new Error('Authentication failed'));
    }
  });

  logger.info('Socket.IO server initialized');
  return io;
};

/**
 * Get Socket.IO instance
 * @returns {Object} Socket.IO instance
 */
const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};

module.exports = {
  initializeSocket,
  getIO
};
