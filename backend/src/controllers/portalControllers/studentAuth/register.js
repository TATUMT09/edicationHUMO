const Joi = require('joi');
const mongoose = require('mongoose');
const { generate: uniqueId } = require('shortid');

const generateCode = require('@/utils/generateCode');
const sendMail = require('@/controllers/middlewaresControllers/createAuthMiddleware/sendMail');

const register = async (req, res) => {
  const Student = mongoose.model('Student');
  const StudentPassword = mongoose.model('StudentPassword');

  const { firstName, lastName, dateOfBirth, email, password, purpose } = req.body;

  const objectSchema = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    dateOfBirth: Joi.date().max('now').required(),
    email: Joi.string()
      .email({ tlds: { allow: true } })
      .required(),
    password: Joi.string().min(6).required(),
    purpose: Joi.string()
      .valid(
        'pupil',
        'applicant',
        'student_higher',
        'teacher',
        'parent',
        'new_skill',
        'language',
        'self_improve'
      )
      .optional(),
  });

  const { error } = objectSchema.validate({
    firstName,
    lastName,
    dateOfBirth,
    email,
    password,
    purpose,
  });
  if (error) {
    return res.status(409).json({
      success: false,
      result: null,
      message: "Ism, familiya, tug'ilgan sana, email va parol (kamida 6 belgi) to'g'ri kiritilishi shart.",
      errorMessage: error.message,
    });
  }

  const normalizedEmail = email.toLowerCase().trim();
  let student = await Student.findOne({ email: normalizedEmail, removed: false });

  if (student) {
    const existingPassword = await StudentPassword.findOne({ user: student._id, removed: false });
    if (existingPassword?.emailVerified) {
      return res.status(409).json({
        success: false,
        result: null,
        message: "Bu email bilan hisob allaqachon ro'yxatdan o'tgan. Kirish sahifasidan foydalaning.",
      });
    }
    student.firstName = firstName;
    student.lastName = lastName;
    student.dateOfBirth = dateOfBirth;
    if (purpose) student.purpose = purpose;
    await student.save();
  } else {
    student = await new Student({
      firstName,
      lastName,
      dateOfBirth,
      email: normalizedEmail,
      purpose,
    }).save();
  }

  const salt = uniqueId();
  const tmp = new StudentPassword();
  const passwordHash = tmp.generateHash(salt, password);
  const { code, expires } = generateCode();
  const telegramLinkToken = uniqueId() + uniqueId();

  await StudentPassword.findOneAndUpdate(
    { user: student._id },
    {
      user: student._id,
      password: passwordHash,
      salt,
      emailVerified: false,
      emailVerificationCode: code,
      emailVerificationCodeExpires: expires,
      emailVerificationAttempts: 0,
      lastCodeSentAt: new Date(),
      telegramLinkToken,
    },
    { upsert: true, new: true }
  ).exec();

  await sendMail({
    email: normalizedEmail,
    name: student.name,
    code,
    subject: 'HUMO Education - tasdiqlash kodi',
    type: 'emailVerificationCode',
  });

  return res.status(200).json({
    success: true,
    result: { email: normalizedEmail, telegramLinkToken },
    message: 'Tasdiqlash kodi emailingizga yuborildi.',
  });
};

module.exports = register;
