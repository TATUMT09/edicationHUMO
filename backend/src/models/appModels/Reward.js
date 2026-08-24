const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  removed: {
    type: Boolean,
    default: false,
  },
  enabled: {
    type: Boolean,
    default: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: String,
  imageUrl: String,
  starCost: {
    type: Number,
    required: true,
    min: 1,
  },
  // null/undefined = unlimited stock.
  stock: {
    type: Number,
    default: null,
  },
  order: {
    type: Number,
    default: 0,
  },
  createdBy: { type: mongoose.Schema.ObjectId, ref: 'Admin' },
  created: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Reward', schema);
