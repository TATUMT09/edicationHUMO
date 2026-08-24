const mongoose = require('mongoose');

const QUESTION_COUNT_TIERS = require('@/utils/questionCountTiers');

// Fisher-Yates — only reorders the array the student sees; the underlying
// data (which option is correct, question content) is never touched, and
// grading matches by _id, not position, so a shuffled display never affects
// correctness.
const shuffle = (arr) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const getTestToTake = async (req, res) => {
  const Test = mongoose.model('Test');
  const Question = mongoose.model('Question');
  const Attempt = mongoose.model('Attempt');

  const { testId } = req.params;

  const test = await Test.findOne({ _id: testId, removed: false, enabled: true }).exec();
  if (!test) {
    return res.status(404).json({ success: false, result: null, message: 'Test topilmadi.' });
  }

  const allQuestions = await Question.find({ test: testId, removed: false })
    .sort({ order: 1 })
    .exec();
  if (allQuestions.length === 0) {
    return res.status(409).json({
      success: false,
      result: null,
      message: "Bu testda hali savollar yo'q.",
    });
  }

  // Re-derive the allowed tiers server-side — never trust the client's
  // `count`, since it drives how many (and which) questions get served.
  const allowedTiers = QUESTION_COUNT_TIERS.filter((tier) => tier <= allQuestions.length);
  if (allowedTiers.length === 0) allowedTiers.push(allQuestions.length);

  const requestedCount = parseInt(req.query.count, 10);
  if (!allowedTiers.includes(requestedCount)) {
    return res.status(400).json({
      success: false,
      result: { allowedTiers },
      message: "Noto'g'ri savollar soni.",
    });
  }

  // Prefer questions the student didn't just see in their last attempt on
  // this test, so back-to-back retakes don't hand back the same set.
  const lastAttempt = await Attempt.findOne({
    student: req.student._id,
    test: testId,
    removed: false,
  })
    .sort({ submittedAt: -1 })
    .select('answers.question')
    .exec();
  const recentlyUsedIds = new Set((lastAttempt?.answers || []).map((a) => String(a.question)));

  const fresh = allQuestions.filter((q) => !recentlyUsedIds.has(String(q._id)));
  const stale = allQuestions.filter((q) => recentlyUsedIds.has(String(q._id)));
  const pool = shuffle(fresh).concat(shuffle(stale));
  const selected = pool.slice(0, requestedCount);

  // The one thing this endpoint exists to guarantee: never send isCorrect /
  // correctAnswerText to the client before it has submitted an attempt.
  const safeQuestions = shuffle(selected).map((q) => ({
    _id: q._id,
    order: q.order,
    prompt: q.prompt,
    imageUrl: q.imageUrl,
    questionType: q.questionType,
    points: q.points,
    options: shuffle((q.options || []).map((opt) => ({ _id: opt._id, text: opt.text }))),
  }));

  return res.status(200).json({
    success: true,
    result: { test, questions: safeQuestions },
    message: 'Test tayyor.',
  });
};

module.exports = getTestToTake;
