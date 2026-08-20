const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bcrypt = require('bcryptjs');

const StudentPasswordSchema = new Schema({
  removed: {
    type: Boolean,
    default: false,
  },
  user: { type: mongoose.Schema.ObjectId, ref: 'Student', required: true, unique: true },
  password: {
    type: String,
    required: true,
  },
  salt: {
    type: String,
    required: true,
  },
  authType: {
    type: String,
    default: 'email',
  },
  loggedSessions: {
    type: [String],
    default: [],
  },

  emailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationCode: String,
  emailVerificationCodeExpires: Date,
  emailVerificationAttempts: {
    type: Number,
    default: 0,
  },
  lastCodeSentAt: Date,

  resetCode: String,
  resetCodeExpires: Date,
  resetCodeAttempts: {
    type: Number,
    default: 0,
  },

  resetToken: String,
  resetTokenExpires: Date,
});

StudentPasswordSchema.methods.generateHash = function (salt, password) {
  return bcrypt.hashSync(salt + password);
};

StudentPasswordSchema.methods.validPassword = function (salt, userpassword) {
  return bcrypt.compareSync(salt + userpassword, this.password);
};

module.exports = mongoose.model('StudentPassword', StudentPasswordSchema);
