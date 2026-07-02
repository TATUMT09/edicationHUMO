const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  removed: {
    type: Boolean,
    default: false,
  },
  student: {
    type: mongoose.Schema.ObjectId,
    ref: 'Client',
    autopopulate: true,
    required: true,
  },
  group: {
    type: mongoose.Schema.ObjectId,
    ref: 'Group',
    autopopulate: true,
    required: true,
  },
  month: {
    // 'YYYY-MM'
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    default: 0,
  },
  paid: {
    type: Boolean,
    default: false,
  },
  paidAt: {
    type: Date,
  },
  createdBy: { type: mongoose.Schema.ObjectId, ref: 'Admin' },
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

module.exports = mongoose.model('MonthlyPayment', schema);
