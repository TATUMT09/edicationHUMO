// The singleStorageUpload middleware (see routes/appRoutes/appApi.js) already
// wrote the file to disk and set req.body.photo to its relative path before
// this handler runs — nothing left to do but report it back.
const clientUpload = async (req, res) => {
  return res.status(200).json({
    success: true,
    result: { photo: req.body.photo },
    message: 'Rasm muvaffaqiyatli yuklandi.',
  });
};

module.exports = clientUpload;
