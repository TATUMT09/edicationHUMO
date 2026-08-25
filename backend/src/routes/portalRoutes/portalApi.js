const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();

const { catchErrors } = require('@/handlers/errorHandlers');
const studentAuth = require('@/controllers/portalControllers/studentAuth');
const contentController = require('@/controllers/portalControllers/contentController');
const attemptController = require('@/controllers/portalControllers/attemptController');
const statsController = require('@/controllers/portalControllers/statsController');
const leaderboardController = require('@/controllers/portalControllers/leaderboardController');
const starsController = require('@/controllers/portalControllers/starsController');
const rewardController = require('@/controllers/portalControllers/rewardController');
const mistakesController = require('@/controllers/portalControllers/mistakesController');

const rateLimitMessage = {
  success: false,
  result: null,
  message: "Juda ko'p so'rov yuborildi. Birozdan so'ng qayta urining.",
};

// Every route below requires a logged-in student, but nothing here was
// throttled — a script could otherwise hammer any of these all day.
// General cap is generous (normal test-taking/browsing never gets close);
// check-answer gets a tighter one on top since, unlike the others, spamming
// it is a real attack (probing every option of every question to
// reconstruct the answer key) rather than just noise.
router.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: rateLimitMessage,
  })
);
const checkAnswerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitMessage,
});

router.route('/logout').post(catchErrors(studentAuth.logout));

router.route('/subjects').get(catchErrors(contentController.listSubjects));
router.route('/subjects/:subjectId/content').get(catchErrors(contentController.listContent));
router.route('/videos/:videoId').get(catchErrors(contentController.getVideo));
router.route('/books/:bookId').get(catchErrors(contentController.getBook));
router.route('/library').get(catchErrors(contentController.getLibrary));
router.route('/search').get(catchErrors(contentController.search));
router.route('/mistakes').get(catchErrors(mistakesController.listMistakes));
router.route('/tests/:testId/meta').get(catchErrors(contentController.getTestMeta));
router.route('/tests/:testId/take').get(catchErrors(contentController.getTestToTake));

router.route('/tests/:testId/attempts').post(catchErrors(attemptController.submitAttempt));
router
  .route('/tests/:testId/check-answer')
  .post(checkAnswerLimiter, catchErrors(attemptController.checkAnswer));
router.route('/attempts').get(catchErrors(attemptController.listMyAttempts));
router.route('/attempts/:attemptId').get(catchErrors(attemptController.getAttempt));

router.route('/stats/summary').get(catchErrors(statsController.summary));

router.route('/leaderboard').get(catchErrors(leaderboardController.getLeaderboard));
router.route('/stars/history').get(catchErrors(starsController.getHistory));

router.route('/rewards').get(catchErrors(rewardController.listRewards));
router.route('/rewards/:rewardId/purchase').post(catchErrors(rewardController.purchaseReward));
router.route('/reward-orders').get(catchErrors(rewardController.listMyOrders));

module.exports = router;
