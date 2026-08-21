const mongoose = require('mongoose');

// Single choke point for changing a student's star balance. Never write
// Student.totalStars anywhere else — every change must go through here so
// the StarTransaction ledger and the cached total can never drift apart.
const awardStars = async ({ studentId, amount, reason, refType, refId }) => {
  if (!amount) return null;

  const Student = mongoose.model('Student');
  const StarTransaction = mongoose.model('StarTransaction');

  const student = await Student.findOneAndUpdate(
    { _id: studentId },
    { $inc: { totalStars: amount } },
    { new: true }
  ).exec();

  const transaction = await new StarTransaction({
    student: studentId,
    amount,
    reason,
    refType,
    refId,
    balanceAfter: student.totalStars,
  }).save();

  return { student, transaction };
};

module.exports = awardStars;
