const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    isCorrect: { type: Boolean, default: false },
  },
  { _id: true }
);

const schema = new mongoose.Schema({
  removed: {
    type: Boolean,
    default: false,
  },
  test: { type: mongoose.Schema.ObjectId, ref: 'Test', required: true },
  order: {
    type: Number,
    default: 0,
  },
  prompt: {
    type: String,
    required: true,
  },
  imageUrl: String,
  questionType: {
    type: String,
    enum: ['single_choice', 'multi_choice', 'true_false', 'open_response'],
    required: true,
  },
  options: [optionSchema],
  // open_response only — a model answer visible to the teacher for manual
  // grading, never sent to the student.
  correctAnswerText: String,
  points: {
    type: Number,
    default: 1,
  },
  explanation: String,
  created: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Question', schema);
