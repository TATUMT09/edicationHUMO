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
  testType: {
    type: String,
    enum: ['closed', 'open', 'quiz'],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: String,
  timeLimitMinutes: Number,
  passingScorePercent: Number,
  order: {
    type: Number,
    default: 0,
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

module.exports = mongoose.model('Test', schema);
