const mongoose = require('mongoose');

const VALID_LEVELS = ['beginner', 'intermediate', 'advanced'];
const VALID_CATEGORIES = ['study', 'fiction'];

// Standalone library: every book across all subjects/levels, searchable and
// filterable, plus a short "recommended for you" list derived from the
// subject+level pairs the student has actually been attempting tests in —
// so an applicant browsing cold still lands on material relevant to them.
const getLibrary = async (req, res) => {
  const Book = mongoose.model('Book');
  const Attempt = mongoose.model('Attempt');

  const { subjectId, level, q, category } = req.query;

  if (level && !VALID_LEVELS.includes(level)) {
    return res.status(400).json({ success: false, result: null, message: "Noto'g'ri daraja." });
  }
  if (category && !VALID_CATEGORIES.includes(category)) {
    return res.status(400).json({ success: false, result: null, message: "Noto'g'ri turkum." });
  }
  // subjectId/q come straight from the query string — Express parses
  // bracket notation (e.g. ?subjectId[$ne]=null) into a nested object, so
  // without this check a query operator could be smuggled straight into
  // the Mongo filter below instead of a plain id.
  if (subjectId && (typeof subjectId !== 'string' || !mongoose.Types.ObjectId.isValid(subjectId))) {
    return res.status(400).json({ success: false, result: null, message: "Noto'g'ri fan." });
  }
  if (q && typeof q !== 'string') {
    return res.status(400).json({ success: false, result: null, message: "Noto'g'ri so'rov." });
  }

  const query = { removed: false, enabled: true };
  if (subjectId) query.subject = subjectId;
  if (level) query.level = level;
  if (category) query.category = category;
  if (q) {
    const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    query.$or = [{ title: rx }, { author: rx }];
  }

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
