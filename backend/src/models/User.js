const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  name: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  role: {
    type: String,
    enum: ['customer', 'owner', 'delivery'],
    required: true,
    index: true
  },

  // For Owners
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant'
  },

  // For Delivery
  vehicle: {
    type: String,
    enum: ['bike', 'car']
  },
  isAvailable: {
    type: Boolean,
    default: true,
    index: true
  },
  currentLocation: {
    latitude: Number,
    longitude: Number
  },

  // Common fields
  isActive: {
    type: Boolean,
    default: true
  },
  rating: {
    type: Number,
    default: 5.0,
    min: 0,
    max: 5
  },
  totalEarnings: {
    type: Number,
    default: 0,
    min: 0
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes
userSchema.index({ role: 1, isAvailable: 1 });

const User = mongoose.model('User', userSchema);

module.exports = User;
