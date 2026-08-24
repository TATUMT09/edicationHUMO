const mongoose = require('mongoose');

const awardStars = require('@/utils/awardStars');
const readBySettingKey = require('@/middlewares/settings/readBySettingKey');

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

const rankFor = async (Student, totalStars) =>
  (await Student.countDocuments({ totalStars: { $gt: totalStars }, removed: false })) + 1;

const submitAttempt = async (req, res) => {
  const Student = mongoose.model('Student');
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

  const currentStudent = await Student.findById(req.student._id).exec();
  const totalBefore = currentStudent.totalStars;
  const rankBefore = await rankFor(Student, totalBefore);

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

  // Open-response tests aren't graded yet, so no stars until a teacher
  // confirms the score — otherwise a student could bank stars on an
  // answer that later turns out wrong with no way to claw them back.
  let starsEarned = 0;
  let rankAfter = rankBefore;

  let dailyLimitReached = false;

  if (!hasUngraded) {
    const correctCount = gradedAnswers.filter((a) => a.isCorrect === true).length;
    const [perAnswerSetting, perfectBonusSetting, dailyLimitSetting] = await Promise.all([
      readBySettingKey({ settingKey: 'portal_correct_answer_stars' }),
      readBySettingKey({ settingKey: 'portal_perfect_score_bonus' }),
      readBySettingKey({ settingKey: 'portal_daily_star_limit' }),
    ]);
    const perAnswer = perAnswerSetting ? Number(perAnswerSetting.settingValue) : 10;
    const perfectBonus = perfectBonusSetting ? Number(perfectBonusSetting.settingValue) : 50;
    const dailyLimit = dailyLimitSetting ? Number(dailyLimitSetting.settingValue) : 200;

    let computedStars = correctCount * perAnswer + (scorePercent === 100 ? perfectBonus : 0);

    if (computedStars > 0 && dailyLimit > 0) {
      const StarTransaction = mongoose.model('StarTransaction');
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const [todayTotal] = await StarTransaction.aggregate([
        {
          $match: {
            student: req.student._id,
            removed: false,
            amount: { $gt: 0 },
            created: { $gte: todayStart },
          },
        },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]);
      const earnedToday = todayTotal?.total || 0;
      const remainingAllowance = Math.max(dailyLimit - earnedToday, 0);

      if (computedStars > remainingAllowance) {
        computedStars = remainingAllowance;
        dailyLimitReached = true;
      }
    }

    starsEarned = computedStars;

    if (starsEarned > 0) {
      await awardStars({
        studentId: req.student._id,
        amount: starsEarned,
        reason: 'test_completed',
        refType: 'Attempt',
        refId: attempt._id,
      });
      rankAfter = await rankFor(Student, totalBefore + starsEarned);
    }
  }

  return res.status(200).json({
    success: true,
    result: { ...attempt.toObject(), starsEarned, rankBefore, rankAfter, dailyLimitReached },
    message: 'Natija saqlandi.',
  });
};

module.exports = submitAttempt;
