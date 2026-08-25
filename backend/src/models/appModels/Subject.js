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
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  icon: String,
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

const slugify = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9Ѐ-ӿ]+/g, '-')
    .replace(/^-+|-+$/g, '');

// Admin only ever types a name — slug is derived automatically so it's
// never a required field the admin has to think about. On a name collision
// (two subjects with the same name) a short suffix keeps it unique.
schema.pre('validate', async function (next) {
  if (this.slug || !this.name) return next();

  const base = slugify(this.name) || 'fan';
  let candidate = base;
  let suffix = 1;
  const Subject = this.constructor;
  while (await Subject.exists({ slug: candidate, _id: { $ne: this._id } })) {
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }
  this.slug = candidate;
  next();
});

module.exports = mongoose.model('Subject', schema);
