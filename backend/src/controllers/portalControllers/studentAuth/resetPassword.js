const Joi = require('joi');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { generate: uniqueId } = require('shortid');

const resetPassword = async (req, res) => {
  const Student = mongoose.model('Student');
  const StudentPassword = mongoose.model('StudentPassword');
  const { email, resetToken, password } = req.body;

  const objectSchema = Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: true } })
      .required(),
    resetToken: Joi.string().required(),
    password: Joi.string().min(6).required(),
  });
  const { error } = objectSchema.validate({ email, resetToken, password });
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

  const isExpired =
    !studentPassword?.resetTokenExpires || studentPassword.resetTokenExpires < new Date();
  const isMatch = !!studentPassword?.resetToken && resetToken === studentPassword.resetToken;

  if (!isMatch || isExpired) {
    return res.status(403).json({
      success: false,
      result: null,
      message: isExpired
        ? "Sessiya muddati tugagan, qaytadan kod so'rang."
        : "Token noto'g'ri, qaytadan kod so'rang.",
    });
  }

  const salt = uniqueId();
  const tmp = new StudentPassword();
  const hashedPassword = tmp.generateHash(salt, password);
  const token = jwt.sign({ id: student._id }, process.env.JWT_SECRET, { expiresIn: '24h' });

  await StudentPassword.findOneAndUpdate(
    { user: student._id },
    {
      $push: { loggedSessions: token },
      password: hashedPassword,
      salt,
      resetToken: null,
      resetTokenExpires: null,
      emailVerified: true,
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
    message: 'Parol muvaffaqiyatli yangilandi.',
  });
};

module.exports = resetPassword;
