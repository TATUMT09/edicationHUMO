const mongoose = require('mongoose');
const { generate: uniqueId } = require('shortid');
const createCRUDController = require('@/controllers/middlewaresControllers/createCRUDController');

function modelController() {
  const Model = mongoose.model('Parent');
  const ParentPassword = mongoose.model('ParentPassword');
  const methods = createCRUDController('Parent');

  methods.create = async (req, res) => {
    const { password, ...parentData } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'Parol kiritilishi shart',
      });
    }

    parentData.removed = false;
    const parent = await new Model({ ...parentData }).save();

    const parentPassword = new ParentPassword();
    const salt = uniqueId();
    const passwordHash = parentPassword.generateHash(salt, password);

    await new ParentPassword({
      user: parent._id,
      password: passwordHash,
      salt,
    }).save();

    return res.status(200).json({
      success: true,
      result: parent,
      message: 'Successfully Created the document in Model ',
    });
  };

  methods.update = async (req, res) => {
    const { password, ...parentData } = req.body;
    parentData.removed = false;

    const parent = await Model.findOneAndUpdate(
      { _id: req.params.id, removed: false },
      parentData,
      { new: true, runValidators: true }
    ).exec();

    if (!parent) {
      return res.status(404).json({
        success: false,
        result: null,
        message: 'No document found ',
      });
    }

    if (password) {
      const existing = await ParentPassword.findOne({ user: parent._id, removed: false });
      const salt = uniqueId();
      const tmp = new ParentPassword();
      const passwordHash = tmp.generateHash(salt, password);

      if (existing) {
        existing.password = passwordHash;
        existing.salt = salt;
        await existing.save();
      } else {
        await new ParentPassword({ user: parent._id, password: passwordHash, salt }).save();
      }
    }

    return res.status(200).json({
      success: true,
      result: parent,
      message: 'we update this document ',
    });
  };

  return methods;
}

module.exports = modelController();
