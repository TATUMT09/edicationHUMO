const mongoose = require('mongoose');
const createCRUDController = require('@/controllers/middlewaresControllers/createCRUDController');
const { getTeacherGroupId } = require('@/utils/teacherScope');

function modelController() {
  const Model = mongoose.model('Group');
  const methods = createCRUDController('Group');

  const original = { listAll: methods.listAll, filter: methods.filter, list: methods.list };

  // `listAll` (unlike `list`/`filter`) ignores req.query.filter/equal entirely,
  // so restricting a teacher's view requires querying the model directly here.
  methods.listAll = async (req, res) => {
    const groupId = await getTeacherGroupId(req.admin);
    if (groupId === null) {
      return res.status(200).json({ success: true, result: [], message: 'Collection is Empty' });
    }
    if (groupId) {
      const result = await Model.find({ removed: false, _id: groupId }).sort({ created: -1 }).exec();
      return res.status(200).json({ success: true, result, message: 'Successfully found all documents' });
    }
    return original.listAll(req, res);
  };

  const restrictQueryToOwnGroup = async (req, res, run) => {
    const groupId = await getTeacherGroupId(req.admin);
    if (groupId === null) {
      return res.status(200).json({ success: true, result: [], message: 'Collection is Empty' });
    }
    if (groupId) {
      req.query.filter = '_id';
      req.query.equal = groupId;
    }
    return run(req, res);
  };

  methods.list = (req, res) => restrictQueryToOwnGroup(req, res, original.list);
  methods.filter = (req, res) => restrictQueryToOwnGroup(req, res, original.filter);

  const ownerOnly = (handler) => (req, res) => {
    if (req.admin?.role === 'teacher') {
      return res.status(403).json({
        success: false,
        result: null,
        message: "Bu amal faqat administratorlar uchun ruxsat etilgan",
      });
    }
    return handler(req, res);
  };

  methods.create = ownerOnly(methods.create);
  methods.update = ownerOnly(methods.update);
  methods.delete = ownerOnly(methods.delete);

  return methods;
}

module.exports = modelController();
