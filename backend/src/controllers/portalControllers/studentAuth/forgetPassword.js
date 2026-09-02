const Joi = require('joi');
const mongoose = require('mongoose');
const { generate: uniqueId } = require('shortid');

const generateCode = require('@/utils/generateCode');

const forgetPassword = async (req, res) => {
  const Student = mongoose.model('Student');
  const StudentPassword = mongoose.model('StudentPassword');
  const { email } = req.body;

  const objectSchema = Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: true } })
      .required(),
  });
  const { error } = objectSchema.validate({ email });
  if (error) {
    return res.status(409).json({
      success: false,
      result: null,
      message: "Email noto'g'ri.",
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

  const { code, expires } = generateCode();
  const telegramLinkToken = uniqueId() + uniqueId();

  await StudentPassword.findOneAndUpdate(
    { user: student._id },
    {
      resetCode: code,
      resetCodeExpires: expires,
      resetCodeAttempts: 0,
      telegramLinkToken,
    },
    { new: true }
  ).exec();

  // Code delivery is Telegram-only now — see tryDeliverStudentCode in
  // bot/telegramBot.js for the actual send (same deep-link pattern as
  // register.js/resendCode.js use for the verification code).
  return res.status(200).json({
    success: true,
    result: { telegramLinkToken },
    message: "Parolni tiklash kodini Telegram orqali oling.",
  });
};

module.exports = forgetPassword;
