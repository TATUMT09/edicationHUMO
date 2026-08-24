// The singleStorageUpload middleware (see routes/appRoutes/appApi.js) already
// wrote the file to disk and set req.body.imageUrl to its relative path
// before this handler runs — nothing left to do but report it back.
const rewardUpload = async (req, res) => {
  return res.status(200).json({
    success: true,
    result: { imageUrl: req.body.imageUrl },
    message: 'Rasm muvaffaqiyatli yuklandi.',
  });
};

module.exports = rewardUpload;
