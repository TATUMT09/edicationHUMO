// The singleStorageUpload middleware (see routes/appRoutes/appApi.js) already
// wrote the file to disk and set req.body.videoUrl to its relative path
// before this handler runs — nothing left to do but report it back.
const videoLessonUpload = async (req, res) => {
  return res.status(200).json({
    success: true,
    result: { videoUrl: req.body.videoUrl },
    message: 'Video muvaffaqiyatli yuklandi.',
  });
};

module.exports = videoLessonUpload;
