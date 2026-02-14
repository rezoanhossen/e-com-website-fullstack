const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  subtitle: String,
  description: String,
  image: {
    type: String,
    required: true
  },
  link: String,
  position: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  type: {
    type: String,
    enum: ['hero', 'promotional', 'category'],
    default: 'hero'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Banner', bannerSchema);
