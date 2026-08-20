const express = require('express');
const router = express.Router();

const { catchErrors } = require('@/handlers/errorHandlers');
const studentAuth = require('@/controllers/portalControllers/studentAuth');
const contentController = require('@/controllers/portalControllers/contentController');
const attemptController = require('@/controllers/portalControllers/attemptController');
const statsController = require('@/controllers/portalControllers/statsController');

router.route('/logout').post(catchErrors(studentAuth.logout));

router.route('/subjects').get(catchErrors(contentController.listSubjects));
router.route('/subjects/:subjectId/content').get(catchErrors(contentController.listContent));
router.route('/videos/:videoId').get(catchErrors(contentController.getVideo));
router.route('/tests/:testId/take').get(catchErrors(contentController.getTestToTake));

router.route('/tests/:testId/attempts').post(catchErrors(attemptController.submitAttempt));
router.route('/attempts').get(catchErrors(attemptController.listMyAttempts));
router.route('/attempts/:attemptId').get(catchErrors(attemptController.getAttempt));

router.route('/stats/summary').get(catchErrors(statsController.summary));

module.exports = router;
