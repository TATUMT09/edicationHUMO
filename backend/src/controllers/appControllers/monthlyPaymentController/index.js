const mongoose = require('mongoose');
const createCRUDController = require('@/controllers/middlewaresControllers/createCRUDController');
const { getTeacherGroupId } = require('@/utils/teacherScope');

function modelController() {
  const Model = mongoose.model('MonthlyPayment');
  const methods = createCRUDController('MonthlyPayment');

  const forbidden = (res) =>
    res.status(403).json({
      success: false,
      result: null,
      message: "Bu amal faqat o'z guruhingiz uchun ruxsat etilgan",
    });

  const original = {
    listAll: methods.listAll,
    filter: methods.filter,
    list: methods.list,
    create: methods.create,
    update: methods.update,
  };

  methods.create = async (req, res) => {
    const groupId = await getTeacherGroupId(req.admin);
    if (groupId === null || (groupId && req.body.group !== groupId)) return forbidden(res);

    const amount = req.body.amount ?? 0;
    const paidAmount = req.body.paidAmount ?? 0;
    req.body.paidAmount = paidAmount;
    req.body.paid = paidAmount >= amount && amount > 0;
    if (paidAmount > 0) req.body.paidAt = new Date();

    return original.create(req, res);
  };

  methods.update = async (req, res) => {
    const groupId = await getTeacherGroupId(req.admin);
    if (groupId === null) return forbidden(res);

    const existing = await Model.findOne({ _id: req.params.id, removed: false });
    if (!existing) {
      return res.status(404).json({ success: false, result: null, message: 'No document found' });
    }
    // `group` is autopopulated (a full document), so always compare via ._id.
    if (groupId && String(existing.group?._id || existing.group) !== groupId) return forbidden(res);

    const amount = req.body.amount ?? existing.amount;
    const paidAmount = req.body.paidAmount ?? existing.paidAmount;
    req.body.paidAmount = paidAmount;
    req.body.paid = paidAmount >= amount && amount > 0;
    if (paidAmount > (existing.paidAmount || 0)) req.body.paidAt = new Date();

    return original.update(req, res);
  };

  methods.filter = async (req, res) => {
    const groupId = await getTeacherGroupId(req.admin);
    if (groupId === null) {
      return res.status(200).json({ success: true, result: [], message: 'Collection is Empty' });
    }
    if (groupId && req.query.filter === 'group' && req.query.equal !== groupId) {
      return res.status(200).json({ success: true, result: [], message: 'Collection is Empty' });
    }
    return original.filter(req, res);
  };

  // `listAll` (unlike `list`/`filter`) ignores req.query.filter/equal entirely,
  // so restricting a teacher's view requires querying the model directly here.
  methods.listAll = async (req, res) => {
    const groupId = await getTeacherGroupId(req.admin);
    if (groupId === null) {
      return res.status(200).json({ success: true, result: [], message: 'Collection is Empty' });
    }
    if (groupId) {
      const result = await Model.find({ removed: false, group: groupId }).sort({ created: -1 }).exec();
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
      req.query.filter = 'group';
      req.query.equal = groupId;
    }
    return run(req, res);
  };

  methods.list = (req, res) => restrictQueryToOwnGroup(req, res, original.list);

  return methods;
}

module.exports = modelController();
