const { TelegramBot } = require('node-telegram-bot-api');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

let bot = null;

// In-memory conversation state for the step-by-step login flow.
// chatId -> { step: 'username' | 'password', username, messageIds: number[] }
const pendingLogins = new Map();

async function deleteMessages(chatId, messageIds) {
  for (const id of messageIds) {
    try {
      await bot.deleteMessage(chatId, id);
    } catch (err) {
      // ignore — bot may not have delete rights, not critical
    }
  }
}

async function askForUsername(chatId, triggerMessageId) {
  const messageIds = triggerMessageId ? [triggerMessageId] : [];
  const sent = await bot.sendMessage(chatId, 'Login kiriting:', {
    reply_markup: { remove_keyboard: true },
  });
  messageIds.push(sent.message_id);
  pendingLogins.set(chatId, { step: 'username', messageIds });
}

async function askForPassword(chatId, username, usernameMessageId) {
  const pending = pendingLogins.get(chatId) || { messageIds: [] };
  const messageIds = [...pending.messageIds, usernameMessageId];
  const sent = await bot.sendMessage(chatId, 'Parol kiriting:');
  messageIds.push(sent.message_id);
  pendingLogins.set(chatId, { step: 'password', username, messageIds });
}

async function finishLogin(chatId, username, password, passwordMessageId) {
  const pending = pendingLogins.get(chatId);
  const messageIds = [...(pending?.messageIds || []), passwordMessageId].filter(Boolean);
  pendingLogins.delete(chatId);

  // Clean up the login/password back-and-forth so the chat stays tidy.
  await deleteMessages(chatId, messageIds);

  const loggedInAsAdmin = await tryAdminLogin(chatId, username, password);
  if (loggedInAsAdmin) return;

  const loggedInAsParent = await tryParentLogin(chatId, username, password);
  if (loggedInAsParent) return;

  bot.sendMessage(chatId, "❌ Login yoki parol xato. Qaytadan urinish uchun /login deb yozing.");
}

function startBot() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.log('⚠️  TELEGRAM_BOT_TOKEN not set — Telegram bot disabled');
    return;
  }

  bot = new TelegramBot(token, { polling: true });

  bot.onText(/^\/start/, async (msg) => {
    const chatId = msg.chat.id;
    await bot.sendMessage(
      chatId,
      'Assalomu alaykum! HUMO Education botiga xush kelibsiz.\n\n' +
        'Tizimga kirish uchun administratordan olgan login va parolingiz kerak bo\'ladi.'
    );
    askForUsername(chatId);
  });

  bot.onText(/^\/login\s*(.*)/, (msg, match) => {
    const chatId = msg.chat.id;
    const rest = match[1].trim();

    // Backward-compatible one-liner: /login username password
    const parts = rest.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      finishLogin(chatId, parts[0].toLowerCase(), parts[1], msg.message_id);
      return;
    }

    askForUsername(chatId, msg.message_id);
  });

  bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (!text || text.startsWith('/')) return;

    const pending = pendingLogins.get(chatId);
    if (!pending) return;

    if (pending.step === 'username') {
      askForPassword(chatId, text.trim().toLowerCase(), msg.message_id);
      return;
    }

    if (pending.step === 'password') {
      finishLogin(chatId, pending.username, text, msg.message_id);
    }
  });

  bot.on('polling_error', (err) => {
    console.error('Telegram bot polling error:', err.message);
  });

  console.log('🤖 Telegram bot started');
}

async function tryAdminLogin(chatId, email, password) {
  const Admin = mongoose.model('Admin');
  const AdminPassword = mongoose.model('AdminPassword');

  const admin = await Admin.findOne({ email, removed: false });
  if (!admin) return false;

  const adminPassword = await AdminPassword.findOne({ user: admin._id, removed: false });
  const isMatch =
    adminPassword && (await bcrypt.compare(adminPassword.salt + password, adminPassword.password));
  if (!isMatch) return false;

  admin.telegramChatId = String(chatId);
  await admin.save();
  await bot.sendMessage(chatId, `✅ Login muvaffaqiyatli: ${admin.name}`);
  bot.sendMessage(chatId, 'Endi tizim hisobotlari shu yerga keladi.');
  return true;
}

async function tryParentLogin(chatId, username, password) {
  const Parent = mongoose.model('Parent');
  const ParentPassword = mongoose.model('ParentPassword');

  const parent = await Parent.findOne({ username, removed: false });
  if (!parent) return false;

  const parentPassword = await ParentPassword.findOne({ user: parent._id, removed: false });
  const isMatch =
    parentPassword &&
    (await bcrypt.compare(parentPassword.salt + password, parentPassword.password));
  if (!isMatch) return false;

  parent.telegramChatId = String(chatId);
  await parent.save();

  const childrenNames = (parent.children || []).map((c) => c.name).join(', ') || "hali biriktirilmagan";
  await bot.sendMessage(chatId, `✅ Login muvaffaqiyatli: ${parent.name}`);
  bot.sendMessage(
    chatId,
    `Farzandlaringiz: ${childrenNames}.\nEndi davomat va to'lov haqida xabarlar shu yerga keladi.`
  );
  return true;
}

async function notifyParentsOfStudent(studentId, text) {
  if (!bot) return 0;
  const Parent = mongoose.model('Parent');
  const parents = await Parent.find({
    removed: false,
    children: studentId,
    telegramChatId: { $exists: true, $ne: null },
  });

  let sent = 0;
  for (const parent of parents) {
    try {
      await bot.sendMessage(parent.telegramChatId, text);
      sent++;
    } catch (err) {
      console.error('Failed to notify parent:', err.message);
    }
  }
  return sent;
}

async function notifyAttendance(student, group, dateStr, status) {
  if (!bot || !student?._id) return 0;
  const text =
    status === 'present'
      ? `Assalomu alaykum! ${student.name} bugun (${dateStr}) "${group?.name || ''}" guruhidagi darsga keldi.`
      : `Assalomu alaykum! ${student.name} bugun (${dateStr}) "${group?.name || ''}" guruhidagi darsga kelmadi.`;
  return notifyParentsOfStudent(student._id, text);
}

async function notifyUnpaidReminder(debtors) {
  if (!bot) return { sent: 0 };
  let sent = 0;
  for (const { student, remaining, paidAmount } of debtors) {
    const text =
      paidAmount > 0
        ? `Assalomu alaykum! Eslatma: ${student.name} uchun shu oylik to'lovdan ${remaining.toLocaleString('ru-RU')} so'm qarz qoldi (${paidAmount.toLocaleString('ru-RU')} so'm to'langan). Iltimos, qolgan summani to'lang.`
        : `Assalomu alaykum! Eslatma: ${student.name} uchun shu oylik to'lov hali amalga oshirilmagan (${remaining.toLocaleString('ru-RU')} so'm). Iltimos, to'lovni amalga oshiring.`;
    sent += await notifyParentsOfStudent(student._id, text);
  }
  return { sent };
}

async function notifyBirthday(student) {
  if (!bot || !student?._id) return 0;
  return notifyParentsOfStudent(
    student._id,
    `🎉 Tabriklaymiz! Bugun ${student.name} ning tug'ilgan kuni!\n\nHUMO Education jamoasi sizni va farzandingizni chin qalbdan tabriklaydi, unga sog'lom-omon, baxtli hayot tilaydi!`
  );
}

module.exports = { startBot, notifyAttendance, notifyUnpaidReminder, notifyBirthday };
