const mongoose = require('mongoose');

const generateCode = require('@/utils/generateCode');
const sendMail = require('@/controllers/middlewaresControllers/createAuthMiddleware/sendMail');

const RESEND_COOLDOWN_MS = 60 * 1000;

const resendCode = async (req, res) => {
  const Student = mongoose.model('Student');
  const StudentPassword = mongoose.model('StudentPassword');
  const { email } = req.body;

  if (!email) {
    return res.status(409).json({ success: false, result: null, message: 'Email kiritilishi shart.' });
  }

  const student = await Student.findOne({ email: email.toLowerCase().trim(), removed: false });
  if (!student) {
    return res.status(404).json({
      success: false,
      result: null,
      message: 'Bunday email bilan hisob topilmadi.',
    });
  }

  const studentPassword = await StudentPassword.findOne({ user: student._id, removed: false });
  if (!studentPassword) {
    return res.status(404).json({
      success: false,
      result: null,
      message: "Avval ro'yxatdan o'ting.",
    });
  }

  if (studentPassword.emailVerified) {
    return res.status(409).json({
      success: false,
      result: null,
      message: 'Email allaqachon tasdiqlangan.',
    });
  }

  if (
    studentPassword.lastCodeSentAt &&
    Date.now() - new Date(studentPassword.lastCodeSentAt).getTime() < RESEND_COOLDOWN_MS
  ) {
    return res.status(429).json({
      success: false,
      result: null,
      message: "1 daqiqadan keyin qaytadan urinib ko'ring.",
    });
  }

  const { code, expires } = generateCode();

  await StudentPassword.findOneAndUpdate(
    { user: student._id },
    {
      emailVerificationCode: code,
      emailVerificationCodeExpires: expires,
      emailVerificationAttempts: 0,
      lastCodeSentAt: new Date(),
    }
  ).exec();

  await sendMail({
    email: student.email,
    name: student.name,
    code,
    subject: 'HUMO Education - tasdiqlash kodi',
    type: 'emailVerificationCode',
  });

  return res.status(200).json({ success: true, result: null, message: 'Kod qaytadan yuborildi.' });
};

module.exports = resendCode;
