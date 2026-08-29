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
  photo: String,
  // 128-length face descriptor computed client-side (face-api.js) from
  // `photo` — never computed or re-derived on the server, just stored.
  faceDescriptor: [Number],
  phone: String,
  country: String,
  address: String,
  email: String,
  birthday: Date,
  school: String,
  grade: String,
  group: { type: mongoose.Schema.ObjectId, ref: 'Group', autopopulate: true },
  createdBy: { type: mongoose.Schema.ObjectId, ref: 'Admin' },
  assigned: { type: mongoose.Schema.ObjectId, ref: 'Admin' },
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

module.exports = mongoose.model('Client', schema);
