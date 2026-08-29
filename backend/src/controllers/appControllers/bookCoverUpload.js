// The singleStorageUpload middleware already wrote the file to disk and set
// req.body.coverImage to its relative path before this handler runs.
const bookCoverUpload = async (req, res) => {
  return res.status(200).json({
    success: true,
    result: { coverImage: req.body.coverImage },
    message: 'Muqova yuklandi.',
  });
};

module.exports = bookCoverUpload;
