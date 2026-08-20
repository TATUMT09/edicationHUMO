const express = require('express');
const rateLimit = require('express-rate-limit');

const router = express.Router();

const { catchErrors } = require('@/handlers/errorHandlers');
const adminAuth = require('@/controllers/coreControllers/adminAuth');

const rateLimitMessage = {
  success: false,
  result: null,
  message: 'Too many attempts. Try again later.',
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

// Brute-force guard: an IP gets 10 attempts per 15 minutes against an
// endpoint that reveals whether credentials are valid.
const loginLimiter = makeLimiter(10);

const forgetPasswordLimiter = makeLimiter(5);

// The 10-wrong-attempts business rule (see verifyResetCode.js) is the
// limit that should normally bite first, so this HTTP-level cap is set
// comfortably above it.
const codeLimiter = makeLimiter(20);

const resetPasswordLimiter = makeLimiter(10);

router.route('/login').post(loginLimiter, catchErrors(adminAuth.login));

router
  .route('/forgetpassword')
  .post(forgetPasswordLimiter, catchErrors(adminAuth.forgetPassword));
router
  .route('/verify-reset-code')
  .post(codeLimiter, catchErrors(adminAuth.verifyResetCode));
router
  .route('/resetpassword')
  .post(resetPasswordLimiter, catchErrors(adminAuth.resetPassword));

router.route('/logout').post(adminAuth.isValidAuthToken, catchErrors(adminAuth.logout));

module.exports = router;
