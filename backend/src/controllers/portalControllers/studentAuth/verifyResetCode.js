const Joi = require('joi');
const mongoose = require('mongoose');
const { generate: uniqueId } = require('shortid');

const RESET_TOKEN_TTL_MS = 15 * 60 * 1000;

const verifyResetCode = async (req, res) => {
  const Student = mongoose.model('Student');
  const StudentPassword = mongoose.model('StudentPassword');
  const { email, code } = req.body;

  const objectSchema = Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: true } })
      .required(),
    code: Joi.string().required(),
  });
  const { error } = objectSchema.validate({ email, code });
  if (error) {
    return res.status(409).json({
      success: false,
      result: null,
      message: "Ma'lumotlar noto'g'ri.",
      errorMessage: error.message,
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
  if (!studentPassword?.resetCode) {
    return res.status(403).json({
      success: false,
      result: null,
      message: "Avval kod so'rang.",
    });
  }

  if (studentPassword.resetCodeAttempts >= 10) {
    return res.status(403).json({
      success: false,
      result: null,
      message: "Urinishlar soni tugadi, qaytadan kod so'rang.",
    });
  }

  const isExpired =
    !studentPassword.resetCodeExpires || studentPassword.resetCodeExpires < new Date();
  const isMatch = code === studentPassword.resetCode;

  if (!isMatch || isExpired) {
    await StudentPassword.findOneAndUpdate(
      { user: student._id },
      { $inc: { resetCodeAttempts: 1 } }
    ).exec();
    return res.status(403).json({
      success: false,
      result: null,
      message: isExpired ? 'Kod muddati tugagan.' : "Kod noto'g'ri.",
    });
  }

  const resetToken = uniqueId() + uniqueId();

  await StudentPassword.findOneAndUpdate(
    { user: student._id },
    {
      resetToken,
      resetTokenExpires: new Date(Date.now() + RESET_TOKEN_TTL_MS),
      resetCode: null,
      resetCodeExpires: null,
      resetCodeAttempts: 0,
    }
  ).exec();

  return res.status(200).json({
    success: true,
    result: { resetToken },
    message: 'Kod tasdiqlandi. Endi yangi parol o‘rnating.',
  });
};

module.exports = verifyResetCode;
