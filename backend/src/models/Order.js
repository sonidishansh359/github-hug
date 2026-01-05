const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true,
    index: true
  },

  items: [{
    menuItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem'
    },
    name: String,
    quantity: {
      type: Number,
      min: 1,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    subtotal: {
      type: Number,
      required: true
    }
  }],

  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },

  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'delivered', 'cancelled'],
    default: 'pending',
    index: true
  },

  deliveryAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: String,
    pincode: { type: String, required: true },
    phone: { type: String, required: true },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },

  deliveryBoyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  deliveryFee: {
    type: Number,
    default: 0,
    min: 0
  },
  estimatedDeliveryTime: {
    type: Number
  },
  actualDeliveryTime: {
    type: Date
  },

  paymentId: {
    type: String
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'success', 'failed', 'refunded'],
    default: 'pending'
  },
  refundId: {
    type: String
  },

  cancellationReason: {
    type: String
  },
  cancelledBy: {
    type: String,
    enum: ['customer', 'owner', 'system']
  },

  statusHistory: [{
    status: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }]
}, {
  timestamps: true
});

// Indexes for performance
orderSchema.index({ customerId: 1, createdAt: -1 });
orderSchema.index({ restaurantId: 1, createdAt: -1 });
orderSchema.index({ deliveryBoyId: 1, status: 1 });
orderSchema.index({ status: 1, createdAt: -1 });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
