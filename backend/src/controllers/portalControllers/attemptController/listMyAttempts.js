const mongoose = require('mongoose');

const listMyAttempts = async (req, res) => {
  const Attempt = mongoose.model('Attempt');

  const attempts = await Attempt.find({ student: req.student._id, removed: false })
    .sort({ startedAt: -1 })
    .limit(200)
    .exec();

  return res.status(200).json({
    success: true,
    result: attempts,
    message: 'Urinishlar tarixi',
  });
};

module.exports = listMyAttempts;
