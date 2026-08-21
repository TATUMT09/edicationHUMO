const mongoose = require('mongoose');

// Rolling windows (last 24h / 7d / 30d) rather than calendar day/week/month —
// simpler, no timezone-boundary edge cases, and "weekly" reads the same
// whether it's Monday or Saturday.
const PERIOD_MS = {
  daily: 24 * 60 * 60 * 1000,
  weekly: 7 * 24 * 60 * 60 * 1000,
  monthly: 30 * 24 * 60 * 60 * 1000,
};

const getLeaderboard = async (req, res) => {
  const Student = mongoose.model('Student');
  const StarTransaction = mongoose.model('StarTransaction');

  const period = ['daily', 'weekly', 'monthly'].includes(req.query.period)
    ? req.query.period
    : 'overall';
  const limit = Math.min(Number(req.query.limit) || 50, 100);
  const since = period === 'overall' ? null : new Date(Date.now() - PERIOD_MS[period]);

  let entries;
  let myTotal;
  let myRank;

  if (period === 'overall') {
    const top = await Student.find({ removed: false })
      .sort({ totalStars: -1 })
      .limit(limit)
      .select('firstName lastName photo totalStars')
      .exec();
    entries = top.map((s, i) => ({
      rank: i + 1,
      student: { _id: s._id, name: s.name, photo: s.photo },
      stars: s.totalStars,
    }));

    const me = await Student.findById(req.student._id).select('totalStars').exec();
    myTotal = me.totalStars;
    myRank = (await Student.countDocuments({ totalStars: { $gt: myTotal }, removed: false })) + 1;
  } else {
    const grouped = await StarTransaction.aggregate([
      { $match: { created: { $gte: since }, removed: false } },
      { $group: { _id: '$student', stars: { $sum: '$amount' } } },
      { $sort: { stars: -1 } },
      { $limit: limit },
      { $lookup: { from: 'students', localField: '_id', foreignField: '_id', as: 'studentDoc' } },
      { $unwind: '$studentDoc' },
      {
        $project: {
          _id: 0,
          student: {
            _id: '$studentDoc._id',
            name: { $concat: ['$studentDoc.firstName', ' ', '$studentDoc.lastName'] },
            photo: '$studentDoc.photo',
          },
          stars: 1,
        },
      },
    ]);
    entries = grouped.map((g, i) => ({ rank: i + 1, ...g }));

    const [myGroup] = await StarTransaction.aggregate([
      { $match: { created: { $gte: since }, removed: false, student: req.student._id } },
      { $group: { _id: null, stars: { $sum: '$amount' } } },
    ]);
    myTotal = myGroup?.stars || 0;

    const [aheadCount] = await StarTransaction.aggregate([
      { $match: { created: { $gte: since }, removed: false } },
      { $group: { _id: '$student', stars: { $sum: '$amount' } } },
      { $match: { stars: { $gt: myTotal } } },
      { $count: 'ahead' },
    ]);
    myRank = (aheadCount?.ahead || 0) + 1;
  }

  return res.status(200).json({
    success: true,
    result: { period, entries, myRank, myStars: myTotal },
    message: 'Reyting',
  });
};

module.exports = getLeaderboard;
