const mongoose = require('mongoose');
const moment = require('moment');

const { notifyAttendance, notifyDeparture } = require('@/bot/telegramBot');

// A face detected again within this window after check-in is treated as
// "still here, camera saw them again" and ignored — the kiosk polls every
// ~1.5s, so without this every glance at the camera would create noise.
// Past the window, a re-detection is treated as "leaving".
const CHECKOUT_AFTER_MINUTES = 20;

// Called by the entrance kiosk once it has matched a live camera frame to
// an enrolled Client entirely in the browser (face-api.js) — this endpoint
// never does any face matching itself, it only records the outcome the
// client already computed, the same trust level as every other admin-panel
// write in this app.
const faceCheckin = async (req, res) => {
  const Client = mongoose.model('Client');
  const Attendance = mongoose.model('Attendance');

  const { clientId } = req.body;
  if (typeof clientId !== 'string' || !mongoose.Types.ObjectId.isValid(clientId)) {
    return res.status(400).json({ success: false, result: null, message: "Noto'g'ri o'quvchi." });
  }

  const client = await Client.findOne({ _id: clientId, removed: false }).exec();
  if (!client) {
    return res.status(404).json({ success: false, result: null, message: "O'quvchi topilmadi." });
  }
  if (!client.group) {
    return res.status(409).json({
      success: false,
      result: null,
      message: "Bu o'quvchi hech qanday guruhga biriktirilmagan.",
    });
  }

  const dateStr = moment().format('YYYY-MM-DD');
  const now = new Date();

  let record = await Attendance.findOne({
    student: client._id,
    group: client.group,
    date: dateStr,
    removed: false,
  }).exec();

  if (!record) {
    record = await new Attendance({
      student: client._id,
      group: client.group,
      date: dateStr,
      status: 'present',
      checkInAt: now,
      source: 'face',
    }).save();

    const populated = await Attendance.findById(record._id).exec();
    notifyAttendance(populated.student, populated.group, dateStr, 'present').catch(() => {});

    return res.status(200).json({
      success: true,
      result: { event: 'check-in', attempt: record },
      message: `${client.name} — keldi.`,
    });
  }

  if (!record.checkOutAt) {
    const minutesSinceCheckIn = (now - new Date(record.checkInAt)) / 60000;
    if (minutesSinceCheckIn >= CHECKOUT_AFTER_MINUTES) {
      record.checkOutAt = now;
      await record.save();

      const populated = await Attendance.findById(record._id).exec();
      const timeStr = moment(now).format('HH:mm');
      notifyDeparture(populated.student, populated.group, dateStr, timeStr).catch(() => {});

      return res.status(200).json({
        success: true,
        result: { event: 'check-out', attempt: record },
        message: `${client.name} — ketdi.`,
      });
    }
  }

  return res.status(200).json({
    success: true,
    result: { event: 'already-recorded', attempt: record },
    message: `${client.name} — allaqachon qayd etilgan.`,
  });
};

module.exports = faceCheckin;
