const mongoose = require('mongoose');

const VALID_LEVELS = ['beginner', 'intermediate', 'advanced'];

// Standalone library: every book across all subjects/levels, searchable and
// filterable, plus a short "recommended for you" list derived from the
// subject+level pairs the student has actually been attempting tests in —
// so an applicant browsing cold still lands on material relevant to them.
const getLibrary = async (req, res) => {
  const Book = mongoose.model('Book');
  const Attempt = mongoose.model('Attempt');

  const { subjectId, level, q } = req.query;

  if (level && !VALID_LEVELS.includes(level)) {
    return res.status(400).json({ success: false, result: null, message: "Noto'g'ri daraja." });
  }

  const query = { removed: false, enabled: true };
  if (subjectId) query.subject = subjectId;
  if (level) query.level = level;
  if (q) query.$or = [{ title: new RegExp(q, 'i') }, { author: new RegExp(q, 'i') }];

  const books = await Book.find(query).sort({ order: 1, title: 1 }).exec();

  const topSubjectLevels = await Attempt.aggregate([
    { $match: { student: req.student._id, removed: false, subject: { $ne: null } } },
    { $group: { _id: { subject: '$subject', level: '$level' }, count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 3 },
  ]);

  let recommended = [];
  if (topSubjectLevels.length > 0) {
    recommended = await Book.find({
      removed: false,
      enabled: true,
      $or: topSubjectLevels.map((t) => ({ subject: t._id.subject, level: t._id.level })),
    })
      .limit(8)
      .exec();
  }

  return res.status(200).json({
    success: true,
    result: { books, recommended },
    message: "Kutubxona ro'yxati",
  });
};

module.exports = getLibrary;
