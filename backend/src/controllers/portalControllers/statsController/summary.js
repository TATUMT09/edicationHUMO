const mongoose = require('mongoose');

const MIN_ANSWERS_FOR_WEAK_SUBJECT = 3;

const summary = async (req, res) => {
  const Attempt = mongoose.model('Attempt');
  const Student = mongoose.model('Student');
  const StarTransaction = mongoose.model('StarTransaction');
  const studentId = req.student._id;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [todayTestsCount, [todayStarsAgg]] = await Promise.all([
    Attempt.countDocuments({ student: studentId, removed: false, submittedAt: { $gte: todayStart } }),
    StarTransaction.aggregate([
      { $match: { student: studentId, removed: false, amount: { $gt: 0 }, created: { $gte: todayStart } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
  ]);
  const todayStars = todayStarsAgg?.total || 0;

  const me = await Student.findById(studentId).select('totalStars').exec();
  const totalStars = me?.totalStars || 0;
  const currentRank =
    (await Student.countDocuments({ totalStars: { $gt: totalStars }, removed: false })) + 1;

  const [overall] = await Attempt.aggregate([
    { $match: { student: studentId, removed: false } },
    { $unwind: '$answers' },
    {
      $group: {
        _id: null,
        totalAnswered: { $sum: 1 },
        totalCorrect: { $sum: { $cond: [{ $eq: ['$answers.isCorrect', true] }, 1, 0] } },
        totalIncorrect: { $sum: { $cond: [{ $eq: ['$answers.isCorrect', false] }, 1, 0] } },
        totalPending: { $sum: { $cond: [{ $eq: ['$answers.isCorrect', null] }, 1, 0] } },
      },
    },
    { $project: { _id: 0, totalAnswered: 1, totalCorrect: 1, totalIncorrect: 1, totalPending: 1 } },
  ]);

  const bySubject = await Attempt.aggregate([
    { $match: { student: studentId, removed: false } },
    { $unwind: '$answers' },
    {
      $group: {
        _id: '$subject',
        correct: { $sum: { $cond: [{ $eq: ['$answers.isCorrect', true] }, 1, 0] } },
        incorrect: { $sum: { $cond: [{ $eq: ['$answers.isCorrect', false] }, 1, 0] } },
        pending: { $sum: { $cond: [{ $eq: ['$answers.isCorrect', null] }, 1, 0] } },
      },
    },
    {
      $lookup: {
        from: 'subjects',
        localField: '_id',
        foreignField: '_id',
        as: 'subjectDoc',
      },
    },
    {
      $project: {
        _id: 0,
        subjectId: '$_id',
        subjectName: { $arrayElemAt: ['$subjectDoc.name', 0] },
        correct: 1,
        incorrect: 1,
        pending: 1,
      },
    },
    { $sort: { subjectName: 1 } },
  ]);

  const attemptsCount = await Attempt.countDocuments({ student: studentId, removed: false });

  // Weakest subject the student has answered enough of to be meaningful —
  // surfaced on the home dashboard as a one-line practice nudge.
  let weakSubject = null;
  for (const s of bySubject) {
    const answered = s.correct + s.incorrect;
    if (answered < MIN_ANSWERS_FOR_WEAK_SUBJECT) continue;
    const percent = Math.round((s.correct / answered) * 100);
    if (!weakSubject || percent < weakSubject.percent) {
      weakSubject = { subjectId: s.subjectId, subjectName: s.subjectName, percent };
    }
  }

  return res.status(200).json({
    success: true,
    result: {
      attemptsCount,
      totalStars,
      currentRank,
      totalAnswered: overall?.totalAnswered || 0,
      totalCorrect: overall?.totalCorrect || 0,
      totalIncorrect: overall?.totalIncorrect || 0,
      totalPending: overall?.totalPending || 0,
      bySubject,
      todayTestsCount,
      todayStars,
      weakSubject,
    },
    message: 'Statistika',
  });
};

module.exports = summary;
