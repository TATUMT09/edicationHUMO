const mongoose = require('mongoose');

const listRewards = async (req, res) => {
  const Reward = mongoose.model('Reward');

  const rewards = await Reward.find({ removed: false, enabled: true })
    .sort({ order: 1, starCost: 1 })
    .exec();

  return res.status(200).json({ success: true, result: rewards, message: "Sovg'alar ro'yxati" });
};

module.exports = listRewards;
