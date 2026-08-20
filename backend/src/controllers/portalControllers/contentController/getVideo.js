const mongoose = require('mongoose');

const getVideo = async (req, res) => {
  const VideoLesson = mongoose.model('VideoLesson');

  const video = await VideoLesson.findOne({
    _id: req.params.videoId,
    removed: false,
    enabled: true,
  }).exec();

  if (!video) {
    return res.status(404).json({ success: false, result: null, message: 'Video topilmadi.' });
  }

  return res.status(200).json({ success: true, result: video, message: 'Video' });
};

module.exports = getVideo;
