const cron = require('node-cron');
const { sendUnpaidReminders } = require('./scheduledJobs');

const REMINDER_DAY_OF_MONTH = 1;
const REMINDER_HOUR = 9;

function startScheduler() {
  // Runs every day at 09:00, but only actually sends reminders on the 1st of the month.
  cron.schedule(`0 ${REMINDER_HOUR} * * *`, async () => {
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

  console.log(
    `⏰ To'lov eslatmasi rejalashtiruvchisi ishga tushdi (har oyning ${REMINDER_DAY_OF_MONTH}-sanasida soat ${REMINDER_HOUR}:00 da)`
  );
}

module.exports = { startScheduler };
