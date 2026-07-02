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
  name: {
    type: String,
    required: true,
  },
  phone: String,
  username: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  children: {
    type: [{ type: mongoose.Schema.ObjectId, ref: 'Client', autopopulate: true }],
    default: [],
  },
  telegramChatId: {
    type: String,
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

module.exports = mongoose.model('Parent', schema);
