const mongoose = require('mongoose');
const { sendUnpaidReminders } = require('@/bot/scheduledJobs');
const { notifyAttendance } = require('@/bot/telegramBot');
const { getTeacherGroupId } = require('@/utils/teacherScope');

const unpaidReminder = async (req, res) => {
  const { unpaidCount, sent } = await sendUnpaidReminders();

  return res.status(200).json({
    success: true,
    result: { unpaidCount, sent },
    message: `Eslatma ${sent} ta ota-onaga yuborildi`,
  });
};

// If "Xabar yuborish" is pressed several times in quick succession (e.g. the
// admin is still toggling statuses), only the last click within this window
// actually triggers a send — earlier clicks in the same burst are coalesced
// into it, so parents only get the final state instead of one message per click.
const DEBOUNCE_MS = 4000;
const pendingAttendanceSends = new Map();

async function sendAttendanceStatusNow(group, date) {
  const Attendance = mongoose.model('Attendance');
  const records = await Attendance.find({ removed: false, group, date });

  // Only notify about records whose status actually changed since the last
  // time a notification was sent — repeated clicks shouldn't resend the same
  // "keldi"/"kelmadi" status over and over.
  const changedRecords = records.filter(
    (record) =>
      (record.status === 'present' || record.status === 'absent') &&
      record.status !== record.lastNotifiedStatus
  );

  let sent = 0;
  for (const record of changedRecords) {
    sent += (await notifyAttendance(record.student, record.group, record.date, record.status)) || 0;
    record.lastNotifiedStatus = record.status;
    await record.save();
  }

  return { recordCount: changedRecords.length, sent };
}

const attendanceStatus = async (req, res) => {
  const { group, date } = req.body;
  if (!group || !date) {
    return res.status(400).json({
      success: false,
      result: null,
      message: 'Guruh va sana kiritilishi shart',
    });
  }

  const groupId = await getTeacherGroupId(req.admin);
  if (groupId === null || (groupId && group !== groupId)) {
    return res.status(403).json({
      success: false,
      result: null,
      message: "Bu amal faqat o'z guruhingiz uchun ruxsat etilgan",
    });
  }

  const key = `${group}_${date}`;
  const pending = pendingAttendanceSends.get(key);
  if (pending) clearTimeout(pending.timeout);

  const waiters = pending ? pending.waiters : [];

  const result = await new Promise((resolve) => {
    waiters.push(resolve);
    const timeout = setTimeout(async () => {
      pendingAttendanceSends.delete(key);
      const outcome = await sendAttendanceStatusNow(group, date);
      waiters.forEach((resolveWaiter) => resolveWaiter(outcome));
    }, DEBOUNCE_MS);
    pendingAttendanceSends.set(key, { timeout, waiters });
  });

  return res.status(200).json({
    success: true,
    result,
    message:
      result.recordCount > 0
        ? `Davomat xabari ${result.sent} ta ota-onaga yuborildi`
        : "Yangi o'zgarish yo'q, hech kimga xabar yuborilmadi",
  });
};

module.exports = { unpaidReminder, attendanceStatus };
