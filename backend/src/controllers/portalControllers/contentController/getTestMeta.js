const mongoose = require('mongoose');

const QUESTION_COUNT_TIERS = require('@/utils/questionCountTiers');

// Cheap pre-flight for the test-taking chooser screen: how many questions
// exist, and which of the fixed count tiers the student may pick from. Never
// loads the questions themselves — that only happens once a tier is chosen.
const getTestMeta = async (req, res) => {
  const Test = mongoose.model('Test');
  const Question = mongoose.model('Question');
  const Attempt = mongoose.model('Attempt');

  const { testId } = req.params;

  const test = await Test.findOne({ _id: testId, removed: false, enabled: true }).exec();
  if (!test) {
    return res.status(404).json({ success: false, result: null, message: 'Test topilmadi.' });
  }

  // Tests are single-attempt — if the student already has one (graded or
  // still awaiting teacher review), send the id straight back so the
  // frontend can skip the chooser and go to the result instead of letting
  // them start again.
  const existingAttempt = await Attempt.findOne({
    student: req.student._id,
    test: testId,
    removed: false,
  })
    .select('_id scorePercent status')
    .exec();

  const availableCount = await Question.countDocuments({ test: testId, removed: false });
  const allowedTiers =
    availableCount > 0
      ? QUESTION_COUNT_TIERS.filter((tier) => tier <= availableCount)
      : [];
  if (allowedTiers.length === 0 && availableCount > 0) {
    allowedTiers.push(availableCount);
  }

  return res.status(200).json({
    success: true,
    result: { test, availableCount, allowedTiers, existingAttempt: existingAttempt || null },
    message: 'Test tayyor.',
  });
};

module.exports = getTestMeta;
