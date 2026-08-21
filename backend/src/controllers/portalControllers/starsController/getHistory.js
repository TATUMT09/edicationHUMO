const mongoose = require('mongoose');

const getHistory = async (req, res) => {
  const StarTransaction = mongoose.model('StarTransaction');

  const transactions = await StarTransaction.find({
    student: req.student._id,
    removed: false,
  })
    .sort({ created: -1 })
    .limit(200)
    .exec();

  return res.status(200).json({
    success: true,
    result: transactions,
    message: 'Yulduzlar tarixi',
  });
};

module.exports = getHistory;
