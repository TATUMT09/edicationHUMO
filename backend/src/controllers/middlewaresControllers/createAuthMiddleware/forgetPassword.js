const Joi = require('joi');

const mongoose = require('mongoose');

const generateCode = require('@/utils/generateCode');
const sendMail = require('./sendMail');

const forgetPassword = async (req, res, { userModel }) => {
  const UserPassword = mongoose.model(userModel + 'Password');
  const User = mongoose.model(userModel);
  const { email } = req.body;

  // validate
  const objectSchema = Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: true } })
      .required(),
  });

  const { error, value } = objectSchema.validate({ email });
  if (error) {
    return res.status(409).json({
      success: false,
      result: null,
      message: 'Invalid email.',
      errorMessage: error.message,
    });
  }

  const user = await User.findOne({ email: email.toLowerCase().trim(), removed: false });

  if (!user)
    return res.status(404).json({
      success: false,
      result: null,
      message: 'No account with this email has been registered.',
    });

  if (!user.enabled)
    return res.status(409).json({
      success: false,
      result: null,
      message: 'Your account is disabled, contact your account adminstrator',
    });

  const { code, expires } = generateCode();

  await UserPassword.findOneAndUpdate(
    { user: user._id },
    { resetCode: code, resetCodeExpires: expires, resetCodeAttempts: 0 },
    { new: true }
  ).exec();

  await sendMail({
    email: user.email,
    name: user.name,
    code,
    subject: 'HUMO Education - parolni tiklash kodi',
    type: 'emailVerificationCode',
  });

  return res.status(200).json({
    success: true,
    result: null,
    message: 'Parolni tiklash kodi emailingizga yuborildi.',
  });
};

module.exports = forgetPassword;
