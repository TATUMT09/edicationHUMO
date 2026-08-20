const createAuthMiddleware = require('@/controllers/middlewaresControllers/createAuthMiddleware');

const register = require('./register');
const verifyCode = require('./verifyCode');
const resendCode = require('./resendCode');
const login = require('./login');
const forgetPassword = require('./forgetPassword');
const verifyResetCode = require('./verifyResetCode');
const resetPassword = require('./resetPassword');

const generic = createAuthMiddleware('Student');

module.exports = {
  register,
  verifyCode,
  resendCode,
  login,
  forgetPassword,
  verifyResetCode,
  resetPassword,
  logout: generic.logout,
  isValidAuthToken: generic.isValidAuthToken,
};
