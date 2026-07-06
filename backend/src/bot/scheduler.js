const cron = require('node-cron');
const { sendUnpaidReminders, sendBirthdayCongratulations } = require('./scheduledJobs');

const REMINDER_DAY_OF_MONTH = 1;
const DAILY_HOUR = 9;

function startScheduler() {
  // Runs every day at 09:00, but only actually sends payment reminders on the 1st of the month.
  cron.schedule(`0 ${DAILY_HOUR} * * *`, async () => {
    const dayOfMonth = new Date().getDate();
    if (dayOfMonth !== REMINDER_DAY_OF_MONTH) return;

    console.log("📅 Oylik to'lov eslatmasi avtomatik yuborilmoqda...");
    try {
      const { unpaidCount, sent } = await sendUnpaidReminders();
      console.log(
        `📅 Avtomatik eslatma yuborildi: ${sent} ta ota-onaga (jami to'lamagan o'quvchi: ${unpaidCount})`
      );
    } catch (err) {
      console.error('📅 Avtomatik eslatma yuborishda xatolik:', err.message);
    }
  });

  // Runs every day at 09:00 and checks for students whose birthday is today.
  cron.schedule(`0 ${DAILY_HOUR} * * *`, async () => {
    console.log("🎂 Tug'ilgan kunlar tekshirilmoqda...");
    try {
      const { birthdayCount, sent } = await sendBirthdayCongratulations();
      console.log(
        `🎂 Tug'ilgan kun tabriklari yuborildi: ${sent} ta ota-onaga (bugun tug'ilgan kun: ${birthdayCount} o'quvchida)`
      );
    } catch (err) {
      console.error("🎂 Tug'ilgan kun tabrigini yuborishda xatolik:", err.message);
    }
  });

  console.log(
    `⏰ Rejalashtiruvchi ishga tushdi: oylik to'lov eslatmasi (har oyning ${REMINDER_DAY_OF_MONTH}-sanasida), tug'ilgan kun tabriklari (har kuni) — soat ${DAILY_HOUR}:00 da`
  );
}

module.exports = { startScheduler };
