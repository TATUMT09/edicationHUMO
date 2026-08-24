const mongoose = require('mongoose');

const QUESTION_COUNT_TIERS = require('@/utils/questionCountTiers');

// Cheap pre-flight for the test-taking chooser screen: how many questions
// exist, and which of the fixed count tiers the student may pick from. Never
// loads the questions themselves — that only happens once a tier is chosen.
const getTestMeta = async (req, res) => {
  const Test = mongoose.model('Test');
  const Question = mongoose.model('Question');

  const { testId } = req.params;

  const test = await Test.findOne({ _id: testId, removed: false, enabled: true }).exec();
  if (!test) {
    return res.status(404).json({ success: false, result: null, message: 'Test topilmadi.' });
  }

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
    result: { test, availableCount, allowedTiers },
    message: 'Test tayyor.',
  });
};

module.exports = getTestMeta;
