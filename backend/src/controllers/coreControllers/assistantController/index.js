const mongoose = require('mongoose');
const moment = require('moment');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { getTeacherGroupId } = require('@/utils/teacherScope');

let genAI = null;
function getClient() {
  if (!process.env.GOOGLE_AI_API_KEY) return null;
  if (!genAI) genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
  return genAI;
}

// Stuffs the current group/student/attendance/payment state into plain text
// for the model's system instruction. Fine at this school's scale (a handful
// of groups) — would need real retrieval (tool use) past a few hundred students.
async function buildContext(groupId) {
  const Group = mongoose.model('Group');
  const Client = mongoose.model('Client');
  const Attendance = mongoose.model('Attendance');
  const MonthlyPayment = mongoose.model('MonthlyPayment');

  const groupQuery = { removed: false, ...(groupId ? { _id: groupId } : {}) };
  const groups = await Group.find(groupQuery).exec();
  const groupIds = groups.map((g) => g._id);

  const students = await Client.find({ removed: false, group: { $in: groupIds } }).exec();

  const currentMonth = moment().format('YYYY-MM');
  const attendance = await Attendance.find({
    removed: false,
    group: { $in: groupIds },
    date: { $gte: `${currentMonth}-01` },
  }).exec();

  const payments = await MonthlyPayment.find({
    removed: false,
    group: { $in: groupIds },
    month: currentMonth,
  }).exec();

  const lines = [];

  lines.push('GURUHLAR:');
  groups.forEach((g) => {
    lines.push(`- ${g.name} (oylik to'lov: ${g.monthlyFee || 0} so'm)`);
  });

  lines.push('', "O'QUVCHILAR:");
  students.forEach((s) => {
    const group = groups.find((g) => String(g._id) === String(s.group?._id || s.group));
    lines.push(
      `- ${s.name} | Guruh: ${group?.name || '-'} | Maktab: ${s.school || '-'} | Sinf: ${
        s.grade || '-'
      } | Telefon: ${s.phone || '-'}`
    );
  });

  lines.push('', `DAVOMAT (${currentMonth}):`);
  students.forEach((s) => {
    const records = attendance.filter(
      (r) => String(r.student?._id || r.student) === String(s._id)
    );
    if (records.length === 0) {
      lines.push(`- ${s.name}: bu oy davomat yozuvi yo'q`);
      return;
    }
    const present = records.filter((r) => r.status === 'present');
    const absentDays = records
      .filter((r) => r.status === 'absent')
      .map((r) => r.date.slice(-2))
      .join(', ');
    lines.push(
      `- ${s.name}: ${present.length}/${records.length} kun keldi${
        absentDays ? `, kelmagan kunlar: ${absentDays}` : ''
      }`
    );
  });

  lines.push('', `TO'LOVLAR (${currentMonth}):`);
  students.forEach((s) => {
    const payment = payments.find(
      (p) => String(p.student?._id || p.student) === String(s._id)
    );
    const group = groups.find((g) => String(g._id) === String(s.group?._id || s.group));
    const amount = payment ? payment.amount : group?.monthlyFee || 0;
    const paid = payment ? payment.paidAmount || 0 : 0;
    const status = paid >= amount && amount > 0 ? "to'langan" : paid > 0 ? 'qisman to\'langan' : "to'lanmagan";
    lines.push(`- ${s.name}: ${paid}/${amount} so'm (${status})`);
  });

  return lines.join('\n');
}

const ask = async (req, res) => {
  const client = getClient();
  if (!client) {
    return res.status(500).json({
      success: false,
      result: null,
      message: "GOOGLE_AI_API_KEY sozlanmagan. Server .env fayliga kalitni qo'shing.",
    });
  }

  const { question, history } = req.body;
  if (!question || !question.trim()) {
    return res.status(400).json({
      success: false,
      result: null,
      message: 'Savol kiritilishi shart',
    });
  }

  const groupId = await getTeacherGroupId(req.admin);
  if (groupId === null) {
    return res.status(200).json({
      success: true,
      result: { answer: "Sizga biriktirilgan guruh topilmadi, shuning uchun ma'lumot yo'q." },
    });
  }

  const context = await buildContext(groupId);

  // Gemini uses "model" (not "assistant") for the assistant role, and a
  // parts[] wrapper around each turn's text.
  const priorMessages = Array.isArray(history)
    ? history
        .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && m.content)
        .slice(-10)
        .map((m) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: String(m.content) }],
        }))
    : [];

  const model = client.getGenerativeModel({
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    systemInstruction: `Siz "HUMO Education" o'quv markazi uchun ichki yordamchisiz. Faqat quyida berilgan ma'lumotlar asosida, o'zbek tilida, qisqa va aniq javob bering. Agar javob ma'lumotlar orasida bo'lmasa, "bu haqda ma'lumotim yo'q" deb ayting — hech narsani o'ylab topmang.\n\n${context}`,
  });

  const chat = model.startChat({ history: priorMessages });
  const result = await chat.sendMessage(question);
  const answer = result.response.text();

  return res.status(200).json({
    success: true,
    result: { answer },
    message: 'OK',
  });
};

module.exports = { ask };
