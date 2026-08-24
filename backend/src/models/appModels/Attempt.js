const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema(
  {
    question: { type: mongoose.Schema.ObjectId, ref: 'Question', required: true },
    selectedOptionIds: [String],
    freeTextAnswer: String,
    // null until graded — open_response answers stay null (pending manual
    // review) until a teacher grades them via the admin panel.
    isCorrect: { type: Boolean, default: null },
    pointsAwarded: { type: Number, default: 0 },
    teacherComment: String,
  },
  { _id: false }
);

const schema = new mongoose.Schema({
  removed: {
    type: Boolean,
    default: false,
  },
  student: { type: mongoose.Schema.ObjectId, ref: 'Student', required: true, autopopulate: true },
  test: { type: mongoose.Schema.ObjectId, ref: 'Test', required: true },
  // Denormalized snapshot so history/stats survive later edits or removal
  // of the Test/Subject it was taken from.
  subject: { type: mongoose.Schema.ObjectId, ref: 'Subject', autopopulate: true },
  level: String,
  testType: String,
  testTitle: String,
  status: {
    type: String,
    enum: ['submitted', 'graded'],
    default: 'submitted',
  },
  answers: [answerSchema],
  score: { type: Number, default: 0 },
  maxScore: { type: Number, default: 0 },
  scorePercent: { type: Number, default: 0 },
  startedAt: {
    type: Date,
    default: Date.now,
  },
  submittedAt: Date,
  gradedAt: Date,
  gradedBy: { type: mongoose.Schema.ObjectId, ref: 'Admin' },
});

schema.plugin(require('mongoose-autopopulate'));

schema.index({ student: 1, test: 1, submittedAt: -1 });

module.exports = mongoose.model('Attempt', schema);
