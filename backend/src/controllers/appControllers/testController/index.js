const mongoose = require('mongoose');
const createCRUDController = require('@/controllers/middlewaresControllers/createCRUDController');
const { getTeacherSubjectId } = require('@/utils/teacherScope');

const FORBIDDEN = {
  success: false,
  result: null,
  message: 'Bu amal faqat o\'z faningizga tegishli testlar uchun ruxsat etilgan',
};

function modelController() {
  const Model = mongoose.model('Test');
  const methods = createCRUDController('Test');

  const original = {
    listAll: methods.listAll,
    filter: methods.filter,
    list: methods.list,
    read: methods.read,
    update: methods.update,
    delete: methods.delete,
    create: methods.create,
    search: methods.search,
  };

  methods.listAll = async (req, res) => {
    const subjectId = getTeacherSubjectId(req.admin);
    if (subjectId === null) {
      return res.status(200).json({ success: true, result: [], message: 'Collection is Empty' });
    }
    if (subjectId) {
      const result = await Model.find({ removed: false, subject: subjectId })
        .sort({ created: -1 })
        .exec();
      return res.status(200).json({ success: true, result, message: 'Successfully found all documents' });
    }
    return original.listAll(req, res);
  };

  const restrictQueryToOwnSubject = async (req, res, run) => {
    const subjectId = getTeacherSubjectId(req.admin);
    if (subjectId === null) {
      return res.status(200).json({ success: true, result: [], message: 'Collection is Empty' });
    }
    if (subjectId) {
      req.query.filter = 'subject';
      req.query.equal = subjectId;
    }
    return run(req, res);
  };

  methods.list = (req, res) => restrictQueryToOwnSubject(req, res, original.list);
  methods.filter = (req, res) => restrictQueryToOwnSubject(req, res, original.filter);

  methods.search = async (req, res) => {
    const subjectId = getTeacherSubjectId(req.admin);
    if (subjectId === undefined) {
      return original.search(req, res);
    }
    if (subjectId === null) {
      return res.status(202).json({ success: false, result: [], message: 'No document found by this request' });
    }

    const fieldsArray = req.query.fields ? req.query.fields.split(',') : ['title'];
    const fields = { $or: fieldsArray.map((field) => ({ [field]: { $regex: new RegExp(req.query.q, 'i') } })) };

    const results = await Model.find({ ...fields, subject: subjectId })
      .where('removed', false)
      .limit(20)
      .exec();

    if (results.length >= 1) {
      return res.status(200).json({ success: true, result: results, message: 'Successfully found all documents' });
    }
    return res.status(202).json({ success: false, result: [], message: 'No document found by this request' });
  };

  // Loads the Test and, for a scoped teacher, verifies it belongs to their
  // subject. Returns the doc on success, or null after already responding.
  const loadOwnedOrRespond = async (req, res) => {
    const test = await Model.findOne({ _id: req.params.id, removed: false }).exec();
    if (!test) {
      res.status(404).json({ success: false, result: null, message: 'No document found' });
      return null;
    }
    const subjectId = getTeacherSubjectId(req.admin);
    if (subjectId === undefined) return test;
    if (subjectId === null || String(test.subject?._id || test.subject) !== subjectId) {
      res.status(403).json(FORBIDDEN);
      return null;
    }
    return test;
  };

  methods.read = async (req, res) => {
    const test = await loadOwnedOrRespond(req, res);
    if (!test) return;
    return original.read(req, res);
  };

  methods.update = async (req, res) => {
    const test = await loadOwnedOrRespond(req, res);
    if (!test) return;
    const subjectId = getTeacherSubjectId(req.admin);
    if (subjectId) req.body.subject = subjectId;
    return original.update(req, res);
  };

  methods.delete = async (req, res) => {
    const test = await loadOwnedOrRespond(req, res);
    if (!test) return;
    return original.delete(req, res);
  };

  methods.create = async (req, res) => {
    const subjectId = getTeacherSubjectId(req.admin);
    if (subjectId === null) {
      return res.status(403).json(FORBIDDEN);
    }
    if (subjectId) req.body.subject = subjectId;
    return original.create(req, res);
  };

  // GET /test/stats/:id — per-question wrong-answer rate for a test, so a
  // teacher can see which questions students are missing most often.
  methods.questionStats = async (req, res) => {
    const test = await loadOwnedOrRespond(req, res);
    if (!test) return;

    const Question = mongoose.model('Question');
    const Attempt = mongoose.model('Attempt');

    const questions = await Question.find({ test: test._id, removed: false })
      .sort({ order: 1, created: 1 })
      .exec();

    const stats = await Attempt.aggregate([
      { $match: { test: test._id, removed: false } },
      { $unwind: '$answers' },
      { $match: { 'answers.isCorrect': { $ne: null } } },
      {
        $group: {
          _id: '$answers.question',
          total: { $sum: 1 },
          wrong: { $sum: { $cond: [{ $eq: ['$answers.isCorrect', false] }, 1, 0] } },
        },
      },
    ]);
    const statsById = new Map(stats.map((s) => [String(s._id), s]));

    const result = questions
      .map((q) => {
        const s = statsById.get(String(q._id)) || { total: 0, wrong: 0 };
        return {
          questionId: q._id,
          prompt: q.prompt,
          order: q.order,
          totalAnswered: s.total,
          wrongCount: s.wrong,
          wrongPercent: s.total > 0 ? Math.round((s.wrong / s.total) * 100) : 0,
        };
      })
      .sort((a, b) => b.wrongPercent - a.wrongPercent || b.wrongCount - a.wrongCount);

    return res.status(200).json({ success: true, result, message: 'OK' });
  };

  return methods;
}

module.exports = modelController();
