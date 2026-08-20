const Joi = require('joi');
const mongoose = require('mongoose');
const { generate: uniqueId } = require('shortid');

const RESET_TOKEN_TTL_MS = 15 * 60 * 1000;

const verifyResetCode = async (req, res, { userModel }) => {
  const UserPassword = mongoose.model(userModel + 'Password');
  const User = mongoose.model(userModel);
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

  const user = await User.findOne({ email: email.toLowerCase().trim(), removed: false });
  if (!user) {
    return res.status(404).json({
      success: false,
      result: null,
      message: 'Bunday email bilan hisob topilmadi.',
    });
  }

  const userPassword = await UserPassword.findOne({ user: user._id, removed: false });
  if (!userPassword?.resetCode) {
    return res.status(403).json({
      success: false,
      result: null,
      message: "Avval kod so'rang.",
    });
  }

  if (userPassword.resetCodeAttempts >= 10) {
    return res.status(403).json({
      success: false,
      result: null,
      message: "Urinishlar soni tugadi, qaytadan kod so'rang.",
    });
  }

  const isExpired = !userPassword.resetCodeExpires || userPassword.resetCodeExpires < new Date();
  const isMatch = code === userPassword.resetCode;

  if (!isMatch || isExpired) {
    await UserPassword.findOneAndUpdate(
      { user: user._id },
      { $inc: { resetCodeAttempts: 1 } }
    ).exec();
    return res.status(403).json({
      success: false,
      result: null,
      message: isExpired ? 'Kod muddati tugagan.' : "Kod noto'g'ri.",
    });
  }

  const resetToken = uniqueId() + uniqueId();

  await UserPassword.findOneAndUpdate(
    { user: user._id },
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
