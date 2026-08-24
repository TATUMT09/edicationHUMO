const mongoose = require('mongoose');

// Not built on top of awardStars() — purchases need a *conditional* deduct
// (never let the balance go negative under concurrent requests), which is
// a single atomic findOneAndUpdate with a $gte guard, not a plain $inc.
// The same "every totalStars change gets a StarTransaction" invariant is
// preserved by hand below.
const purchaseReward = async (req, res) => {
  const Student = mongoose.model('Student');
  const Reward = mongoose.model('Reward');
  const RewardOrder = mongoose.model('RewardOrder');
  const StarTransaction = mongoose.model('StarTransaction');

  const { rewardId } = req.params;

  const reward = await Reward.findOne({ _id: rewardId, removed: false, enabled: true }).exec();
  if (!reward) {
    return res.status(404).json({ success: false, result: null, message: "Sovg'a topilmadi." });
  }

  if (reward.stock != null) {
    const stockUpdated = await Reward.findOneAndUpdate(
      { _id: rewardId, stock: { $gt: 0 } },
      { $inc: { stock: -1 } }
    ).exec();
    if (!stockUpdated) {
      return res.status(409).json({ success: false, result: null, message: "Sovg'a tugagan." });
    }
  }

  const student = await Student.findOneAndUpdate(
    { _id: req.student._id, totalStars: { $gte: reward.starCost } },
    { $inc: { totalStars: -reward.starCost } },
    { new: true }
  ).exec();

  if (!student) {
    if (reward.stock != null) {
      await Reward.findOneAndUpdate({ _id: rewardId }, { $inc: { stock: 1 } }).exec();
    }
    return res.status(409).json({
      success: false,
      result: null,
      message: "Yulduzlaringiz yetarli emas.",
    });
  }

  const order = await new RewardOrder({
    student: req.student._id,
    reward: reward._id,
    rewardTitle: reward.title,
    starCost: reward.starCost,
    status: 'pending',
  }).save();

  await new StarTransaction({
    student: req.student._id,
    amount: -reward.starCost,
    reason: 'reward_purchase',
    refType: 'RewardOrder',
    refId: order._id,
    balanceAfter: student.totalStars,
  }).save();

  return res.status(200).json({
    success: true,
    result: { order, remainingStars: student.totalStars },
    message: "Sovg'a muvaffaqiyatli olindi!",
  });
};

module.exports = purchaseReward;
