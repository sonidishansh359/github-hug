const redis = require('redis');
const { REDIS_URL } = require('./env');
const logger = require('../utils/logger');

let redisClient;

const connectRedis = async () => {
  try {
    redisClient = redis.createClient({
      url: REDIS_URL
    });

    redisClient.on('error', (err) => {
      logger.error('Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      logger.info('Redis connected successfully');
    });

    redisClient.on('ready', () => {
      logger.info('Redis client ready');
    });

    redisClient.on('end', () => {
      logger.warn('Redis client disconnected');
    });

    await redisClient.connect();

    return redisClient;
  } catch (error) {
    logger.error('Redis connection failed:', error);
    // Don't exit process, Redis is not critical for basic functionality
    return null;
  }
};

const getRedisClient = () => {
  return redisClient;
};

module.exports = { connectRedis, getRedisClient };
