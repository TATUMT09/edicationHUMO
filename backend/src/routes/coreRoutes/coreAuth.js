const express = require('express');
const rateLimit = require('express-rate-limit');

const router = express.Router();

const { catchErrors } = require('@/handlers/errorHandlers');
const adminAuth = require('@/controllers/coreControllers/adminAuth');

// Brute-force guard: an IP gets 10 attempts per 15 minutes against an
// endpoint that reveals whether credentials are valid.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, result: null, message: 'Too many login attempts. Try again later.' },
});

router.route('/login').post(loginLimiter, catchErrors(adminAuth.login));

router.route('/forgetpassword').post(loginLimiter, catchErrors(adminAuth.forgetPassword));
router.route('/resetpassword').post(loginLimiter, catchErrors(adminAuth.resetPassword));

router.route('/logout').post(adminAuth.isValidAuthToken, catchErrors(adminAuth.logout));

module.exports = router;
