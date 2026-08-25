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
  // Study books stay tied to a subject+level like tests/videos. Fiction
  // ("badiiy adabiyot") is general reading material — a novel isn't "10th
  // grade Physics" — so neither is required once category is 'fiction'.
  category: {
    type: String,
    enum: ['study', 'fiction'],
    default: 'study',
  },
  subject: {
    type: mongoose.Schema.ObjectId,
    ref: 'Subject',
    autopopulate: true,
    validate: {
      validator: function (v) {
        return this.category !== 'study' || !!v;
      },
      message: "O'quv adabiyoti uchun fan tanlanishi shart.",
    },
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    validate: {
      validator: function (v) {
        return this.category !== 'study' || !!v;
      },
      message: "O'quv adabiyoti uchun daraja tanlanishi shart.",
    },
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

schema.index({ subject: 1, level: 1, enabled: 1, removed: 1 });

module.exports = mongoose.model('Book', schema);
