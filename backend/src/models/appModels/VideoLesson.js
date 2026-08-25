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
  subject: { type: mongoose.Schema.ObjectId, ref: 'Subject', required: true, autopopulate: true },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: String,
  // YouTube/Vimeo link — no upload plumbing needed for V1.
  videoUrl: {
    type: String,
    required: true,
  },
  durationSeconds: Number,
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

schema.plugin(require('mongoose-autopopulate'));

schema.index({ subject: 1, level: 1, enabled: 1, removed: 1 });

module.exports = mongoose.model('VideoLesson', schema);
