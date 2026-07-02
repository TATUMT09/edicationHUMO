const mongoose = require('mongoose');
const moment = require('moment');
const { notifyAdmins } = require('@/bot/telegramBot');
const { sendUnpaidReminders } = require('@/bot/scheduledJobs');

const unpaidReminder = async (req, res) => {
  const { unpaidCount, sent } = await sendUnpaidReminders();

  return res.status(200).json({
    success: true,
    result: { unpaidCount, sent },
    message: `Eslatma ${sent} ta ota-onaga yuborildi`,
  });
};

const adminSummary = async (req, res) => {
  const Client = mongoose.model('Client');
  const Group = mongoose.model('Group');
  const MonthlyPayment = mongoose.model('MonthlyPayment');
  const Attendance = mongoose.model('Attendance');

  const currentMonth = moment().format('YYYY-MM');
  const today = moment().format('YYYY-MM-DD');

  const [students, groups, payments, attendanceToday] = await Promise.all([
    Client.find({ removed: false }),
    Group.find({ removed: false }),
    MonthlyPayment.find({ removed: false, month: currentMonth, paid: true }),
    Attendance.find({ removed: false, date: today }),
  ]);

  const paidCount = payments.length;
  const unpaidCount = students.length - paidCount;
  const presentToday = attendanceToday.filter((a) => a.status === 'present').length;
  const absentToday = attendanceToday.filter((a) => a.status === 'absent').length;

  const text =
    `📊 HUMO Education — kunlik hisobot (${today})\n\n` +
    `Jami o'quvchilar: ${students.length}\n` +
    `Guruhlar: ${groups.length}\n` +
    `Bu oy to'lagan: ${paidCount}\n` +
    `Bu oy to'lamagan: ${unpaidCount}\n` +
    `Bugun kelgan: ${presentToday}\n` +
    `Bugun kelmagan: ${absentToday}`;

  const { sent } = await notifyAdmins(text);

  return res.status(200).json({
    success: true,
    result: { sent },
    message: `Hisobot ${sent} ta administratorga yuborildi`,
  });
};

module.exports = { unpaidReminder, adminSummary };
