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
  reward: { type: mongoose.Schema.ObjectId, ref: 'Reward', required: true, autopopulate: true },
  // Snapshot — the reward's price may change later, the order should keep
  // recording what was actually charged at purchase time.
  rewardTitle: String,
  starCost: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'preparing', 'delivered', 'cancelled'],
    default: 'pending',
  },
  adminNote: String,
  created: {
    type: Date,
    default: Date.now,
  },
  updated: {
    type: Date,
    default: Date.now,
  },
});

schema.plugin(require('mongoose-autopopulate'));

module.exports = mongoose.model('RewardOrder', schema);
