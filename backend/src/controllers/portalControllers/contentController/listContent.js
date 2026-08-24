const mongoose = require('mongoose');

const VALID_LEVELS = ['beginner', 'intermediate', 'advanced'];
const TEST_TYPES = ['closed', 'open', 'quiz'];

const listContent = async (req, res) => {
  const Test = mongoose.model('Test');
  const Question = mongoose.model('Question');
  const VideoLesson = mongoose.model('VideoLesson');
  const Book = mongoose.model('Book');
  const Subject = mongoose.model('Subject');

  const { subjectId } = req.params;
  const { level, type } = req.query;

  if (level && !VALID_LEVELS.includes(level)) {
    return res.status(400).json({ success: false, result: null, message: "Noto'g'ri daraja." });
  }
  if (type && type !== 'video' && type !== 'book' && !TEST_TYPES.includes(type)) {
    return res.status(400).json({ success: false, result: null, message: "Noto'g'ri kontent turi." });
  }

  const subject = await Subject.findOne({ _id: subjectId, removed: false, enabled: true }).exec();
  if (!subject) {
    return res.status(404).json({ success: false, result: null, message: 'Fan topilmadi.' });
  }

  const baseQuery = { subject: subjectId, removed: false, enabled: true };
  if (level) baseQuery.level = level;

  const wantsVideos = !type || type === 'video';
  const wantsBooks = !type || type === 'book';
  const wantsTests = !type || TEST_TYPES.includes(type);

  const [videos, books, tests] = await Promise.all([
    wantsVideos ? VideoLesson.find(baseQuery).sort({ order: 1, title: 1 }).exec() : [],
    wantsBooks ? Book.find(baseQuery).sort({ order: 1, title: 1 }).exec() : [],
    wantsTests
      ? Test.find({ ...baseQuery, ...(type ? { testType: type } : {}) })
          .sort({ order: 1, title: 1 })
          .exec()
      : [],
  ]);

  const testsWithCounts = await Promise.all(
    tests.map(async (test) => {
      const questionCount = await Question.countDocuments({ test: test._id, removed: false });
      return { ...test.toObject(), questionCount };
    })
  );

  return res.status(200).json({
    success: true,
    result: { subject, videos, books, tests: testsWithCounts },
    message: 'Kontent ro\'yxati',
  });
};

module.exports = listContent;
