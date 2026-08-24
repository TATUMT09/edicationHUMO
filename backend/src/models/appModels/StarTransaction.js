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
  student: { type: mongoose.Schema.ObjectId, ref: 'Student', required: true, autopopulate: true },
  amount: {
    type: Number,
    required: true,
  },
  reason: {
    type: String,
    enum: ['test_completed', 'perfect_score_bonus', 'admin_adjustment', 'reward_purchase'],
    required: true,
  },
  refType: { type: String },
  refId: { type: mongoose.Schema.ObjectId },
  balanceAfter: {
    type: Number,
    required: true,
  },
  created: {
    type: Date,
    default: Date.now,
  },
});

schema.plugin(require('mongoose-autopopulate'));

module.exports = mongoose.model('StarTransaction', schema);
