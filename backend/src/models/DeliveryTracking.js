const mongoose = require('mongoose');

const deliveryTrackingSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    unique: true,
    index: true
  },
  deliveryBoyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  route: [{
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],

  currentLocation: {
    latitude: Number,
    longitude: Number,
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },

  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  },

  distanceCovered: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

// Geospatial index for location queries
deliveryTrackingSchema.index({ 'currentLocation': '2dsphere' });

const DeliveryTracking = mongoose.model('DeliveryTracking', deliveryTrackingSchema);

module.exports = DeliveryTracking;
