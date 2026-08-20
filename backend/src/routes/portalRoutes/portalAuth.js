const express = require('express');
const rateLimit = require('express-rate-limit');

const router = express.Router();

const { catchErrors } = require('@/handlers/errorHandlers');
const studentAuth = require('@/controllers/portalControllers/studentAuth');

const rateLimitMessage = {
  success: false,
  result: null,
  message: "Juda ko'p urinish qilindi. Birozdan so'ng qayta urining.",
};

// Each route gets its own limiter instance (not a shared one) so that,
// e.g., a run of failed logins can't eat into the separate code-entry
// budget — the two are unrelated abuse patterns with different caps.
const makeLimiter = (max) =>
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: rateLimitMessage,
  });

// Register/resend actually trigger a real email send, so they get the
// tighter cap.
const strictLimiter = makeLimiter(5);

// Code-entry routes: the 10-wrong-attempts business rule (see
// verifyCode.js / verifyResetCode.js) is the limit that should normally
// bite first, so this HTTP-level cap is set comfortably above it.
const codeLimiter = makeLimiter(20);

const loginLimiter = makeLimiter(10);
const resetPasswordLimiter = makeLimiter(10);

router.route('/register').post(strictLimiter, catchErrors(studentAuth.register));
router.route('/verify-code').post(codeLimiter, catchErrors(studentAuth.verifyCode));
router.route('/resend-code').post(strictLimiter, catchErrors(studentAuth.resendCode));
router.route('/login').post(loginLimiter, catchErrors(studentAuth.login));
router.route('/forgetpassword').post(strictLimiter, catchErrors(studentAuth.forgetPassword));
router.route('/verify-reset-code').post(codeLimiter, catchErrors(studentAuth.verifyResetCode));
router
  .route('/resetpassword')
  .post(resetPasswordLimiter, catchErrors(studentAuth.resetPassword));

module.exports = router;
