const mongoose = require('mongoose');

const getBook = async (req, res) => {
  const Book = mongoose.model('Book');

  const book = await Book.findOne({
    _id: req.params.bookId,
    removed: false,
    enabled: true,
  }).exec();

  if (!book) {
    return res.status(404).json({ success: false, result: null, message: 'Kitob topilmadi.' });
  }

  return res.status(200).json({ success: true, result: book, message: 'Kitob' });
};

module.exports = getBook;
