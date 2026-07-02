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
  date: {
    // 'YYYY-MM-DD'
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['present', 'absent'],
    default: 'present',
    required: true,
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

module.exports = mongoose.model('Attendance', schema);
