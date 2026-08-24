// The singleStorageUpload middleware (see routes/appRoutes/appApi.js) already
// wrote the file to disk and set req.body.fileUrl to its relative path
// before this handler runs — nothing left to do but report it back.
const bookUpload = async (req, res) => {
  return res.status(200).json({
    success: true,
    result: { fileUrl: req.body.fileUrl },
    message: 'Fayl muvaffaqiyatli yuklandi.',
  });
};

module.exports = bookUpload;
