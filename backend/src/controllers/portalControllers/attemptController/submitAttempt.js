const mongoose = require('mongoose');

// Grades a single-/multi-choice/true-false answer by re-deriving correctness
// from the real Question doc — the client's own idea of "correct" (if any)
// is never trusted.
const gradeChoiceAnswer = (question, submittedAnswer) => {
  const correctIds = new Set(
    (question.options || []).filter((opt) => opt.isCorrect).map((opt) => String(opt._id))
  );
  const selectedIds = new Set((submittedAnswer?.selectedOptionIds || []).map(String));

  const isCorrect =
    correctIds.size > 0 &&
    correctIds.size === selectedIds.size &&
    [...correctIds].every((id) => selectedIds.has(id));

  return { isCorrect, pointsAwarded: isCorrect ? question.points || 1 : 0 };
};

const submitAttempt = async (req, res) => {
  const Test = mongoose.model('Test');
  const Question = mongoose.model('Question');
  const Attempt = mongoose.model('Attempt');

  const { testId } = req.params;
  const { answers = [] } = req.body;

  const test = await Test.findOne({ _id: testId, removed: false, enabled: true }).exec();
  if (!test) {
    return res.status(404).json({ success: false, result: null, message: 'Test topilmadi.' });
  }

  const questions = await Question.find({ test: testId, removed: false }).exec();
  if (questions.length === 0) {
    return res.status(409).json({
      success: false,
      result: null,
      message: "Bu testda hali savollar yo'q.",
    });
  }

  const answersByQuestionId = new Map(answers.map((a) => [String(a.question), a]));

  let score = 0;
  let maxScore = 0;
  let hasUngraded = false;

  const gradedAnswers = questions.map((question) => {
    const submitted = answersByQuestionId.get(String(question._id));
    maxScore += question.points || 1;

    if (question.questionType === 'open_response') {
      hasUngraded = true;
      return {
        question: question._id,
        selectedOptionIds: [],
        freeTextAnswer: submitted?.freeTextAnswer || '',
        isCorrect: null,
        pointsAwarded: 0,
      };
    }

    const { isCorrect, pointsAwarded } = gradeChoiceAnswer(question, submitted);
    score += pointsAwarded;

    return {
      question: question._id,
      selectedOptionIds: (submitted?.selectedOptionIds || []).map(String),
      freeTextAnswer: '',
      isCorrect,
      pointsAwarded,
    };
  });

  const scorePercent = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

  const attempt = await new Attempt({
    student: req.student._id,
    test: test._id,
    subject: test.subject?._id || test.subject,
    level: test.level,
    testType: test.testType,
    testTitle: test.title,
    status: hasUngraded ? 'submitted' : 'graded',
    answers: gradedAnswers,
    score,
    maxScore,
    scorePercent,
    submittedAt: new Date(),
    gradedAt: hasUngraded ? undefined : new Date(),
  }).save();

  return res.status(200).json({
    success: true,
    result: attempt,
    message: 'Natija saqlandi.',
  });
};

module.exports = submitAttempt;
