const express = require('express');
const multer = require('multer');
const { catchErrors } = require('@/handlers/errorHandlers');
const router = express.Router();

const appControllers = require('@/controllers/appControllers');
const { routesList } = require('@/models/utils');
const { singleStorageUpload } = require('@/middlewares/uploadMiddleware');
const videoLessonUpload = require('@/controllers/appControllers/videoLessonUpload');
const bookUpload = require('@/controllers/appControllers/bookUpload');
const bookCoverUpload = require('@/controllers/appControllers/bookCoverUpload');
const rewardUpload = require('@/controllers/appControllers/rewardUpload');
const clientUpload = require('@/controllers/appControllers/clientUpload');
const testAiImport = require('@/controllers/appControllers/testAiImport');
const faceRoster = require('@/controllers/appControllers/attendanceController/faceRoster');
const faceCheckin = require('@/controllers/appControllers/attendanceController/faceCheckin');

// In-memory only — the .docx is read once to extract text for the AI
// prompt and never needs to touch disk.
const memoryUpload = multer({ storage: multer.memoryStorage() }).single('file');

const routerApp = (entity, controller) => {
  router.route(`/${entity}/create`).post(catchErrors(controller['create']));
  router.route(`/${entity}/read/:id`).get(catchErrors(controller['read']));
  router.route(`/${entity}/update/:id`).patch(catchErrors(controller['update']));
  router.route(`/${entity}/delete/:id`).delete(catchErrors(controller['delete']));
  router.route(`/${entity}/search`).get(catchErrors(controller['search']));
  router.route(`/${entity}/list`).get(catchErrors(controller['list']));
  router.route(`/${entity}/listAll`).get(catchErrors(controller['listAll']));
  router.route(`/${entity}/filter`).get(catchErrors(controller['filter']));
  router.route(`/${entity}/summary`).get(catchErrors(controller['summary']));

  if (entity === 'invoice' || entity === 'quote' || entity === 'payment') {
    router.route(`/${entity}/mail`).post(catchErrors(controller['mail']));
  }

  if (entity === 'quote') {
    router.route(`/${entity}/convert/:id`).get(catchErrors(controller['convert']));
  }

  if (entity === 'videolesson') {
    router.route(`/${entity}/upload`).post(
      singleStorageUpload({ entity: 'videolesson', fieldName: 'videoUrl', fileType: 'video' }),
      catchErrors(videoLessonUpload)
    );
  }

  if (entity === 'book') {
    router.route(`/${entity}/upload`).post(
      singleStorageUpload({ entity: 'book', fieldName: 'fileUrl', fileType: 'pdf' }),
      catchErrors(bookUpload)
    );
    router.route(`/${entity}/upload-cover`).post(
      singleStorageUpload({ entity: 'book', fieldName: 'coverImage', fileType: 'image' }),
      catchErrors(bookCoverUpload)
    );
  }

  if (entity === 'reward') {
    router.route(`/${entity}/upload`).post(
      singleStorageUpload({ entity: 'reward', fieldName: 'imageUrl', fileType: 'image' }),
      catchErrors(rewardUpload)
    );
  }

  if (entity === 'client') {
    router.route(`/${entity}/upload`).post(
      singleStorageUpload({ entity: 'client', fieldName: 'photo', fileType: 'image' }),
      catchErrors(clientUpload)
    );
  }

  if (entity === 'test') {
    router
      .route(`/${entity}/ai-parse`)
      .post(memoryUpload, catchErrors(testAiImport.parseFile));
    router.route(`/${entity}/ai-import`).post(catchErrors(testAiImport.confirmImport));
  }

  if (entity === 'attendance') {
    router.route('/attendance/face-roster').get(catchErrors(faceRoster));
    router.route('/attendance/face-checkin').post(catchErrors(faceCheckin));
  }
};

routesList.forEach(({ entity, controllerName }) => {
  const controller = appControllers[controllerName];
  routerApp(entity, controller);
});

module.exports = router;
