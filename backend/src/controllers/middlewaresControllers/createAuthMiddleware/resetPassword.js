const Joi = require('joi');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const shortid = require('shortid');

const resetPassword = async (req, res, { userModel }) => {
  const UserPassword = mongoose.model(userModel + 'Password');
  const User = mongoose.model(userModel);
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
      message: 'Invalid reset password object',
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

  const userPassword = await UserPassword.findOne({ user: user._id, removed: false });

  const isExpired =
    !userPassword?.resetTokenExpires || userPassword.resetTokenExpires < new Date();
  const isMatch = !!userPassword?.resetToken && resetToken === userPassword.resetToken;

  if (!isMatch || isExpired)
    return res.status(403).json({
      success: false,
      result: null,
      message: isExpired
        ? "Sessiya muddati tugagan, qaytadan kod so'rang."
        : "Token noto'g'ri, qaytadan kod so'rang.",
    });

  const salt = shortid.generate();
  const hashedPassword = bcrypt.hashSync(salt + password);
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });

  await UserPassword.findOneAndUpdate(
    { user: user._id },
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
      _id: user._id,
      name: user.name,
      surname: user.surname,
      role: user.role,
      email: user.email,
      photo: user.photo,
      token,
      maxAge: req.body.remember ? 365 : null,
    },
    message: 'Parol muvaffaqiyatli yangilandi.',
  });
};

module.exports = resetPassword;
