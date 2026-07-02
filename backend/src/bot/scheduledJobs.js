const mongoose = require('mongoose');
const moment = require('moment');
const { notifyUnpaidReminder } = require('./telegramBot');

async function sendUnpaidReminders() {
  const Client = mongoose.model('Client');
  const MonthlyPayment = mongoose.model('MonthlyPayment');

  const currentMonth = moment().format('YYYY-MM');
  const students = await Client.find({ removed: false });
  const payments = await MonthlyPayment.find({ removed: false, month: currentMonth, paid: true });
  const paidStudentIds = new Set(payments.map((p) => String(p.student)));

  const unpaidStudents = students.filter((s) => !paidStudentIds.has(String(s._id)));
  const { sent } = await notifyUnpaidReminder(unpaidStudents);

  return { unpaidCount: unpaidStudents.length, sent };
}

module.exports = { sendUnpaidReminders };
