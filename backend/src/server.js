const express = require('express');
const http = require('http');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

// Config
const { PORT, FRONTEND_URL, NODE_ENV } = require('./config/env');
const connectDatabase = require('./config/database');
const { connectRedis } = require('./config/redis');
const { initializeSocket } = require('./config/socket');

// Middleware
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Routes
const authRoutes = require('./routes/auth.routes');
const menuRoutes = require('./routes/menu.routes');
const orderRoutes = require('./routes/order.routes');
const paymentRoutes = require('./routes/payment.routes');
const deliveryRoutes = require('./routes/delivery.routes');

// Socket handlers
const { handleConnection, handleDisconnection } = require('./sockets/connectionHandler');
const registerMenuHandlers = require('./sockets/menuHandler');
const registerOrderHandlers = require('./sockets/orderHandler');
const registerDeliveryHandlers = require('./sockets/deliveryHandler');

// Logger
const logger = require('./utils/logger');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = initializeSocket(server);

// Middleware
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Global rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per IP
  message: {
    success: false,
    error: {
      message: 'Too many requests, please try again later',
      code: 'RATE_LIMIT_EXCEEDED',
      statusCode: 429
    }
  }
});

app.use('/api/', limiter);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/delivery', deliveryRoutes);

// Socket.IO connection handling
io.on('connection', (socket) => {
  // Handle connection
  handleConnection(io, socket);

  // Register event handlers
  registerMenuHandlers(io, socket);
  registerOrderHandlers(io, socket);
  registerDeliveryHandlers(io, socket);

  // Handle disconnection
  socket.on('disconnect', () => {
    handleDisconnection(socket);
  });
});

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDatabase();

    // Connect to Redis (optional)
    await connectRedis();

    // Start server
    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} in ${NODE_ENV} mode`);
      logger.info(`Socket.IO server initialized`);
      logger.info(`Frontend URL: ${FRONTEND_URL}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', err);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  server.close(() => process.exit(1));
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

// Start the server
startServer();

module.exports = { app, server, io };
