const mongoose = require('mongoose');
const moment = require('moment');
const { notifyUnpaidReminder, notifyBirthday } = require('./telegramBot');

async function sendUnpaidReminders() {
  const Client = mongoose.model('Client');
  const Group = mongoose.model('Group');
  const MonthlyPayment = mongoose.model('MonthlyPayment');

  const currentMonth = moment().format('YYYY-MM');
  const students = await Client.find({ removed: false });
  const groups = await Group.find({ removed: false });
  const groupFeeById = new Map(groups.map((g) => [String(g._id), g.monthlyFee || 0]));

  const payments = await MonthlyPayment.find({ removed: false, month: currentMonth });
  // `student` is autopopulated (a full document), so stringifying it directly
  // would give "[object Object]" instead of the id — always use ._id.
  const paymentByStudent = new Map(payments.map((p) => [String(p.student._id || p.student), p]));

  const debtors = [];
  for (const student of students) {
    const payment = paymentByStudent.get(String(student._id));
    if (payment?.paid) continue; // fully paid this month, skip

    const amount = payment ? payment.amount : groupFeeById.get(String(student.group?._id || student.group)) || 0;
    const paidAmount = payment ? payment.paidAmount || 0 : 0;
    const remaining = amount - paidAmount;
    if (remaining <= 0) continue;

    debtors.push({ student, remaining, paidAmount });
  }

  const { sent } = await notifyUnpaidReminder(debtors);

  return { unpaidCount: debtors.length, sent };
}

async function sendBirthdayCongratulations() {
  const Client = mongoose.model('Client');

  const today = moment();
  const students = await Client.find({ removed: false, birthday: { $ne: null } });

  const birthdayStudents = students.filter((s) => {
    const b = moment(s.birthday);
    return b.date() === today.date() && b.month() === today.month();
  });

  let sent = 0;
  for (const student of birthdayStudents) {
    sent += await notifyBirthday(student);
  }

  return { birthdayCount: birthdayStudents.length, sent };
}

module.exports = { sendUnpaidReminders, sendBirthdayCongratulations };
