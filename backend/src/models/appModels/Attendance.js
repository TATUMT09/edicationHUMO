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
  // Tracks which status was last sent to parents, so "Xabar yuborish" only
  // notifies about records that actually changed since the previous send.
  lastNotifiedStatus: {
    type: String,
    enum: ['present', 'absent'],
  },
  checkInAt: Date,
  checkOutAt: Date,
  // 'manual' (default) covers every existing/teacher-marked record;
  // 'face' is set only by the face-recognition kiosk.
  source: {
    type: String,
    enum: ['manual', 'face'],
    default: 'manual',
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
