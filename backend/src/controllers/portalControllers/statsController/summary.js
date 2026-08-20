const mongoose = require('mongoose');

const summary = async (req, res) => {
  const Attempt = mongoose.model('Attempt');
  const studentId = req.student._id;

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

  return res.status(200).json({
    success: true,
    result: {
      attemptsCount,
      totalAnswered: overall?.totalAnswered || 0,
      totalCorrect: overall?.totalCorrect || 0,
      totalIncorrect: overall?.totalIncorrect || 0,
      totalPending: overall?.totalPending || 0,
      bySubject,
    },
    message: 'Statistika',
  });
};

module.exports = summary;
