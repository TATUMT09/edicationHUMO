const express = require('express');
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
router.route('/tests/:testId/check-answer').post(catchErrors(attemptController.checkAnswer));
router.route('/attempts').get(catchErrors(attemptController.listMyAttempts));
router.route('/attempts/:attemptId').get(catchErrors(attemptController.getAttempt));

router.route('/stats/summary').get(catchErrors(statsController.summary));

router.route('/leaderboard').get(catchErrors(leaderboardController.getLeaderboard));
router.route('/stars/history').get(catchErrors(starsController.getHistory));

router.route('/rewards').get(catchErrors(rewardController.listRewards));
router.route('/rewards/:rewardId/purchase').post(catchErrors(rewardController.purchaseReward));
router.route('/reward-orders').get(catchErrors(rewardController.listMyOrders));

module.exports = router;
