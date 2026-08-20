const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const verifyCode = async (req, res) => {
  const Student = mongoose.model('Student');
  const StudentPassword = mongoose.model('StudentPassword');
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(409).json({
      success: false,
      result: null,
      message: 'Email va kod kiritilishi shart.',
    });
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
  if (!studentPassword || !studentPassword.emailVerificationCode) {
    return res.status(409).json({
      success: false,
      result: null,
      message: "Avval ro'yxatdan o'ting.",
    });
  }

  if (studentPassword.emailVerificationAttempts >= 10) {
    return res.status(403).json({
      success: false,
      result: null,
      message: "Urinishlar soni tugadi. Kodni qayta yuboring.",
    });
  }

  const isExpired =
    !studentPassword.emailVerificationCodeExpires ||
    studentPassword.emailVerificationCodeExpires < new Date();
  const isMatch = code === studentPassword.emailVerificationCode;

  if (!isMatch || isExpired) {
    await StudentPassword.findOneAndUpdate(
      { user: student._id },
      { $inc: { emailVerificationAttempts: 1 } }
    ).exec();
    return res.status(403).json({
      success: false,
      result: null,
      message: isExpired ? "Kod muddati tugagan, qaytadan so'rang." : "Kod noto'g'ri.",
    });
  }

  const token = jwt.sign({ id: student._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

  await StudentPassword.findOneAndUpdate(
    { user: student._id },
    {
      $push: { loggedSessions: token },
      emailVerified: true,
      emailVerificationCode: null,
      emailVerificationCodeExpires: null,
      emailVerificationAttempts: 0,
    },
    { new: true }
  ).exec();

  return res.status(200).json({
    success: true,
    result: {
      _id: student._id,
      name: student.name,
      email: student.email,
      photo: student.photo,
      token,
    },
    message: 'Email tasdiqlandi.',
  });
};

module.exports = verifyCode;
