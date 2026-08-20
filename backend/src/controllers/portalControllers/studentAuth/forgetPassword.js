const Joi = require('joi');
const mongoose = require('mongoose');

const generateCode = require('@/utils/generateCode');
const sendMail = require('@/controllers/middlewaresControllers/createAuthMiddleware/sendMail');

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

  await StudentPassword.findOneAndUpdate(
    { user: student._id },
    { resetCode: code, resetCodeExpires: expires, resetCodeAttempts: 0 },
    { new: true }
  ).exec();

  await sendMail({
    email: student.email,
    name: student.name,
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
