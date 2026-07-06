const mongoose = require('mongoose');

const fcmTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  // Optional: link to a user
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  // Device / browser info for display in admin
  userAgent: {
    type: String,
    trim: true
  },
  // Topic subscriptions (e.g. 'all', 'jobs', 'blog')
  topics: {
    type: [String],
    default: ['all']
  },
  active: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastSeenAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('FcmToken', fcmTokenSchema);
