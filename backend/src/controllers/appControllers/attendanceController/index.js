const mongoose = require('mongoose');
const createCRUDController = require('@/controllers/middlewaresControllers/createCRUDController');
const { notifyAbsence } = require('@/bot/telegramBot');

function modelController() {
  const Model = mongoose.model('Attendance');
  const methods = createCRUDController('Attendance');

  const notifyIfAbsent = (result) => {
    if (result?.status === 'absent') {
      notifyAbsence(result.student, result.group, result.date);
    }
  };

  methods.create = async (req, res) => {
    req.body.removed = false;
    const result = await new Model({ ...req.body }).save();

    notifyIfAbsent(result);

    return res.status(200).json({
      success: true,
      result,
      message: 'Successfully Created the document in Model ',
    });
  };

  methods.update = async (req, res) => {
    req.body.removed = false;
    const result = await Model.findOneAndUpdate(
      { _id: req.params.id, removed: false },
      req.body,
      { new: true, runValidators: true }
    ).exec();

    if (!result) {
      return res.status(404).json({
        success: false,
        result: null,
        message: 'No document found ',
      });
    }

    notifyIfAbsent(result);

    return res.status(200).json({
      success: true,
      result,
      message: 'we update this document ',
    });
  };

  return methods;
}

module.exports = modelController();
