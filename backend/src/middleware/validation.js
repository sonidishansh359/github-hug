const Joi = require('joi');

/**
 * Validation middleware factory
 * @param {Object} schema - Joi schema object
 */
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => detail.message);
      return res.status(400).json({
        success: false,
        error: {
          message: errors.join(', '),
          code: 'VALIDATION_ERROR',
          statusCode: 400,
          details: error.details
        }
      });
    }

    next();
  };
};

// Common validation schemas
const schemas = {
  // Auth schemas
  sendOTP: Joi.object({
    phone: Joi.string()
      .pattern(/^(\+91)?[6-9]\d{9}$/)
      .required()
      .messages({
        'string.pattern.base': 'Invalid phone number format. Use +919876543210 or 9876543210'
      }),
    role: Joi.string()
      .valid('customer', 'owner', 'delivery')
      .required()
  }),

  verifyOTP: Joi.object({
    phone: Joi.string()
      .pattern(/^(\+91)?[6-9]\d{9}$/)
      .required(),
    otp: Joi.string()
      .length(6)
      .pattern(/^\d+$/)
      .required()
      .messages({
        'string.length': 'OTP must be 6 digits',
        'string.pattern.base': 'OTP must contain only numbers'
      })
  }),

  // Menu item schemas
  createMenuItem: Joi.object({
    restaurantId: Joi.string().required(),
    name: Joi.string().min(3).max(100).required(),
    description: Joi.string().max(500),
    price: Joi.number().min(0).required(),
    category: Joi.string().valid('appetizer', 'main_course', 'dessert', 'beverage', 'other'),
    image: Joi.string().uri(),
    isVeg: Joi.boolean(),
    preparationTime: Joi.number().min(0),
    tags: Joi.array().items(Joi.string())
  }),

  updateMenuItem: Joi.object({
    name: Joi.string().min(3).max(100),
    description: Joi.string().max(500),
    price: Joi.number().min(0),
    category: Joi.string().valid('appetizer', 'main_course', 'dessert', 'beverage', 'other'),
    image: Joi.string().uri(),
    isVeg: Joi.boolean(),
    isAvailable: Joi.boolean(),
    preparationTime: Joi.number().min(0),
    tags: Joi.array().items(Joi.string())
  }),

  // Order schemas
  createOrder: Joi.object({
    restaurantId: Joi.string().required(),
    items: Joi.array().items(
      Joi.object({
        menuItemId: Joi.string().required(),
        quantity: Joi.number().min(1).required()
      })
    ).min(1).required(),
    deliveryAddress: Joi.object({
      street: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string(),
      pincode: Joi.string().required(),
      phone: Joi.string().pattern(/^(\+91)?[6-9]\d{9}$/).required(),
      coordinates: Joi.object({
        latitude: Joi.number().min(-90).max(90),
        longitude: Joi.number().min(-180).max(180)
      })
    }).required(),
    paymentId: Joi.string().required()
  }),

  updateOrderStatus: Joi.object({
    status: Joi.string()
      .valid('pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'delivered', 'cancelled')
      .required(),
    estimatedTime: Joi.number().min(0)
  }),

  cancelOrder: Joi.object({
    reason: Joi.string().max(500).required()
  }),

  // Payment schemas
  createPaymentOrder: Joi.object({
    amount: Joi.number().min(1).required(),
    currency: Joi.string().default('INR')
  }),

  verifyPayment: Joi.object({
    razorpay_order_id: Joi.string().required(),
    razorpay_payment_id: Joi.string().required(),
    razorpay_signature: Joi.string().required()
  }),

  // Delivery schemas
  updateLocation: Joi.object({
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required()
  }),

  completeDelivery: Joi.object({
    deliveryProof: Joi.string().uri()
  }),

  updateDeliveryStatus: Joi.object({
    isAvailable: Joi.boolean().required()
  })
};

module.exports = {
  validate,
  schemas
};
