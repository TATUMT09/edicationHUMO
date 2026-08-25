const mongoose = require('mongoose');

// The portal's home "🔎 Nimani o'rganmoqchisiz?" search — one box across every
// content type instead of making the student dig through Fan → Daraja first.
const search = async (req, res) => {
  const Subject = mongoose.model('Subject');
  const Test = mongoose.model('Test');
  const Book = mongoose.model('Book');
  const VideoLesson = mongoose.model('VideoLesson');

  // req.query.q could be a nested object (Express parses ?q[$ne]=x into
  // one) instead of a string — never let a non-string reach RegExp/Mongo.
  const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  if (q.length < 2) {
    return res.status(200).json({
      success: true,
      result: { subjects: [], tests: [], books: [], videos: [] },
      message: 'OK',
    });
  }

  const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

  const [subjects, tests, books, videos] = await Promise.all([
    Subject.find({ name: rx, removed: false, enabled: true }).limit(8).exec(),
    Test.find({ title: rx, removed: false, enabled: true }).limit(8).exec(),
    Book.find({ $or: [{ title: rx }, { author: rx }], removed: false, enabled: true })
      .limit(8)
      .exec(),
    VideoLesson.find({ title: rx, removed: false, enabled: true }).limit(8).exec(),
  ]);

  return res.status(200).json({
    success: true,
    result: { subjects, tests, books, videos },
    message: 'OK',
  });
};

module.exports = search;
