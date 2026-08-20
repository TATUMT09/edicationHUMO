const Joi = require('joi');
const mongoose = require('mongoose');

const authUser = require('@/controllers/middlewaresControllers/createAuthMiddleware/authUser');

const login = async (req, res) => {
  const Student = mongoose.model('Student');
  const StudentPassword = mongoose.model('StudentPassword');
  const { email, password } = req.body;

  const objectSchema = Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: true } })
      .required(),
    password: Joi.string().required(),
  });

  const { error } = objectSchema.validate({ email, password });
  if (error) {
    return res.status(409).json({
      success: false,
      result: null,
      message: "Email yoki parol noto'g'ri kiritilgan.",
      errorMessage: error.message,
    });
  }

  const student = await Student.findOne({ email: email.toLowerCase().trim(), removed: false });

  // Admin login bilan bir xil: hisob yo'qligi bilan noto'g'ri parolni bir xil
  // status/xabar bilan qaytaramiz, aks holda email mavjudligini bilib olish mumkin.
  if (!student) {
    return res.status(403).json({
      success: false,
      result: null,
      message: "Email yoki parol xato.",
    });
  }

  if (!student.enabled) {
    return res.status(409).json({
      success: false,
      result: null,
      message: 'Hisobingiz faol emas, administrator bilan bog\'laning.',
    });
  }

  const studentPassword = await StudentPassword.findOne({ user: student._id, removed: false });

  if (!studentPassword?.emailVerified) {
    return res.status(403).json({
      success: false,
      result: null,
      message: 'Avval emailingizni tasdiqlang.',
      emailNotVerified: true,
    });
  }

  authUser(req, res, {
    user: student,
    databasePassword: studentPassword,
    password,
    UserPasswordModel: StudentPassword,
  });
};

module.exports = login;
