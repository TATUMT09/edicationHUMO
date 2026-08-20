const mongoose = require('mongoose');

const listSubjects = async (req, res) => {
  const Subject = mongoose.model('Subject');
  const subjects = await Subject.find({ removed: false, enabled: true })
    .sort({ order: 1, name: 1 })
    .exec();

  return res.status(200).json({
    success: true,
    result: subjects,
    message: "Fanlar ro'yxati",
  });
};

module.exports = listSubjects;
