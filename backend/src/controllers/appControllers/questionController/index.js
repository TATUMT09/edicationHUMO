const mongoose = require('mongoose');
const createCRUDController = require('@/controllers/middlewaresControllers/createCRUDController');
const { getTeacherSubjectId } = require('@/utils/teacherScope');

const FORBIDDEN = {
  success: false,
  result: null,
  message: 'Bu amal faqat o\'z faningizga tegishli savollar uchun ruxsat etilgan',
};

// Question has no `subject` of its own — only `test`. Resolve which tests
// belong to the teacher's subject once per request.
async function getOwnTestIds(subjectId) {
  const Test = mongoose.model('Test');
  const ids = await Test.find({ subject: subjectId, removed: false }).distinct('_id');
  return ids;
}

function modelController() {
  const Model = mongoose.model('Question');
  const methods = createCRUDController('Question');

  const original = {
    listAll: methods.listAll,
    list: methods.list,
    filter: methods.filter,
    search: methods.search,
    read: methods.read,
    update: methods.update,
    delete: methods.delete,
    create: methods.create,
  };

  methods.listAll = async (req, res) => {
    const subjectId = getTeacherSubjectId(req.admin);
    if (subjectId === null) {
      return res.status(200).json({ success: true, result: [], message: 'Collection is Empty' });
    }
    if (subjectId) {
      const testIds = await getOwnTestIds(subjectId);
      const result = await Model.find({ removed: false, test: { $in: testIds } })
        .sort({ created: -1 })
        .exec();
      return res.status(200).json({ success: true, result, message: 'Successfully found all documents' });
    }
    return original.listAll(req, res);
  };

  methods.list = async (req, res) => {
    const subjectId = getTeacherSubjectId(req.admin);
    if (subjectId === null) {
      return res
        .status(203)
        .json({ success: true, result: [], pagination: { page: 1, pages: 0, count: 0 }, message: 'Collection is Empty' });
    }
    if (subjectId === undefined) {
      return original.list(req, res);
    }

    const testIds = await getOwnTestIds(subjectId);
    const page = req.query.page || 1;
    const limit = parseInt(req.query.items) || 10;
    const skip = page * limit - limit;
    const { sortBy = 'created', sortValue = -1 } = req.query;

    const fieldsArray = req.query.fields ? req.query.fields.split(',') : [];
    const fields = fieldsArray.length === 0 ? {} : { $or: fieldsArray.map((f) => ({ [f]: { $regex: new RegExp(req.query.q, 'i') } })) };

    const query = { removed: false, test: { $in: testIds }, ...fields };
    const [result, count] = await Promise.all([
      Model.find(query).skip(skip).limit(limit).sort({ [sortBy]: sortValue }).exec(),
      Model.countDocuments(query),
    ]);
    const pagination = { page, pages: Math.ceil(count / limit), count };
    return res.status(count > 0 ? 200 : 203).json({
      success: true,
      result,
      pagination,
      message: count > 0 ? 'Successfully found all documents' : 'Collection is Empty',
    });
  };
  methods.filter = async (req, res) => {
    const subjectId = getTeacherSubjectId(req.admin);
    if (subjectId === undefined) {
      return original.filter(req, res);
    }
    if (subjectId === null || req.query.filter === undefined || req.query.equal === undefined) {
      return res.status(200).json({ success: true, result: [], message: 'Collection is Empty' });
    }
    const testIds = await getOwnTestIds(subjectId);
    const result = await Model.find({ removed: false, test: { $in: testIds } })
      .where(req.query.filter)
      .equals(req.query.equal)
      .exec();
    return res.status(200).json({ success: true, result, message: 'Successfully found all documents' });
  };

  methods.search = async (req, res) => {
    const subjectId = getTeacherSubjectId(req.admin);
    if (subjectId === undefined) {
      return original.search(req, res);
    }
    if (subjectId === null) {
      return res.status(202).json({ success: false, result: [], message: 'No document found by this request' });
    }
    const testIds = await getOwnTestIds(subjectId);
    const fieldsArray = req.query.fields ? req.query.fields.split(',') : ['prompt'];
    const fields = { $or: fieldsArray.map((field) => ({ [field]: { $regex: new RegExp(req.query.q, 'i') } })) };

    const results = await Model.find({ ...fields, test: { $in: testIds } })
      .where('removed', false)
      .limit(20)
      .exec();
    if (results.length >= 1) {
      return res.status(200).json({ success: true, result: results, message: 'Successfully found all documents' });
    }
    return res.status(202).json({ success: false, result: [], message: 'No document found by this request' });
  };

  // Loads the Question and, for a scoped teacher, verifies its Test belongs
  // to their subject. Returns the doc on success, or null after responding.
  const loadOwnedOrRespond = async (req, res) => {
    const question = await Model.findOne({ _id: req.params.id, removed: false }).exec();
    if (!question) {
      res.status(404).json({ success: false, result: null, message: 'No document found' });
      return null;
    }
    const subjectId = getTeacherSubjectId(req.admin);
    if (subjectId === undefined) return question;
    if (subjectId === null) {
      res.status(403).json(FORBIDDEN);
      return null;
    }
    const testIds = await getOwnTestIds(subjectId);
    const owns = testIds.some((id) => String(id) === String(question.test));
    if (!owns) {
      res.status(403).json(FORBIDDEN);
      return null;
    }
    return question;
  };

  methods.read = async (req, res) => {
    const question = await loadOwnedOrRespond(req, res);
    if (!question) return;
    return original.read(req, res);
  };

  methods.update = async (req, res) => {
    const question = await loadOwnedOrRespond(req, res);
    if (!question) return;
    return original.update(req, res);
  };

  methods.delete = async (req, res) => {
    const question = await loadOwnedOrRespond(req, res);
    if (!question) return;
    return original.delete(req, res);
  };

  methods.create = async (req, res) => {
    const subjectId = getTeacherSubjectId(req.admin);
    if (subjectId === undefined) return original.create(req, res);
    if (subjectId === null) return res.status(403).json(FORBIDDEN);

    const Test = mongoose.model('Test');
    const test = await Test.findOne({ _id: req.body.test, removed: false }).exec();
    if (!test || String(test.subject?._id || test.subject) !== subjectId) {
      return res.status(403).json(FORBIDDEN);
    }
    return original.create(req, res);
  };

  return methods;
}

module.exports = modelController();
