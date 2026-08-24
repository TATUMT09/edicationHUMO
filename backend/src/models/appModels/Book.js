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
  author: String,
  description: String,
  // Relative "public/uploads/book/..." path (uploaded PDF) or an external link.
  fileUrl: {
    type: String,
    required: true,
  },
  coverImage: String,
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

module.exports = mongoose.model('Book', schema);
