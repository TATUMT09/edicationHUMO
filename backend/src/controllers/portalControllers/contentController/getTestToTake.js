const mongoose = require('mongoose');

const getTestToTake = async (req, res) => {
  const Test = mongoose.model('Test');
  const Question = mongoose.model('Question');

  const { testId } = req.params;

  const test = await Test.findOne({ _id: testId, removed: false, enabled: true }).exec();
  if (!test) {
    return res.status(404).json({ success: false, result: null, message: 'Test topilmadi.' });
  }

  const questions = await Question.find({ test: testId, removed: false }).sort({ order: 1 }).exec();

  // The one thing this endpoint exists to guarantee: never send isCorrect /
  // correctAnswerText to the client before it has submitted an attempt.
  const safeQuestions = questions.map((q) => ({
    _id: q._id,
    order: q.order,
    prompt: q.prompt,
    imageUrl: q.imageUrl,
    questionType: q.questionType,
    points: q.points,
    options: (q.options || []).map((opt) => ({ _id: opt._id, text: opt.text })),
  }));

  return res.status(200).json({
    success: true,
    result: { test, questions: safeQuestions },
    message: 'Test tayyor.',
  });
};

module.exports = getTestToTake;
