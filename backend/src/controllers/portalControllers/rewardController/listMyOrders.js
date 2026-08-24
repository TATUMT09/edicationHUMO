const mongoose = require('mongoose');

const listMyOrders = async (req, res) => {
  const RewardOrder = mongoose.model('RewardOrder');

  const orders = await RewardOrder.find({ student: req.student._id, removed: false })
    .sort({ created: -1 })
    .exec();

  return res.status(200).json({ success: true, result: orders, message: 'Buyurtmalarim' });
};

module.exports = listMyOrders;
