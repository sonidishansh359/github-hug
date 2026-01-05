/**
 * Generate unique order ID
 * Format: ORD{timestamp}{random4digits}
 * @returns {String} Unique order ID
 */
const generateOrderId = () => {
  const timestamp = Date.now();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `ORD${timestamp}${random}`;
};

/**
 * Generate 6-digit OTP
 * @returns {String} 6-digit OTP
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {Number} lat1 - Latitude of point 1
 * @param {Number} lon1 - Longitude of point 1
 * @param {Number} lat2 - Latitude of point 2
 * @param {Number} lon2 - Longitude of point 2
 * @returns {Number} Distance in kilometers
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 100) / 100; // Round to 2 decimal places
};

const toRad = (degrees) => {
  return degrees * (Math.PI / 180);
};

/**
 * Calculate delivery fee based on distance
 * @param {Number} distance - Distance in kilometers
 * @returns {Number} Delivery fee in rupees
 */
const calculateDeliveryFee = (distance) => {
  const baseFee = 20;
  const perKmFee = 10;

  if (distance <= 2) {
    return baseFee;
  }

  return baseFee + Math.ceil(distance - 2) * perKmFee;
};

/**
 * Calculate delivery earnings
 * @param {Number} orderTotal - Order total amount
 * @returns {Number} Delivery earnings in rupees
 */
const calculateDeliveryEarnings = (orderTotal) => {
  const percentage = orderTotal * 0.1; // 10% of order
  const minimum = 50;

  return Math.max(percentage, minimum);
};

/**
 * Validate phone number format
 * @param {String} phone - Phone number
 * @returns {Boolean} Is valid
 */
const isValidPhone = (phone) => {
  // Accept formats: +919876543210 or 9876543210
  const phoneRegex = /^(\+91)?[6-9]\d{9}$/;
  return phoneRegex.test(phone);
};

/**
 * Validate email format
 * @param {String} email - Email address
 * @returns {Boolean} Is valid
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

module.exports = {
  generateOrderId,
  generateOTP,
  calculateDistance,
  calculateDeliveryFee,
  calculateDeliveryEarnings,
  isValidPhone,
  isValidEmail
};
