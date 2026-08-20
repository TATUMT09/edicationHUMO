const mongoose = require('mongoose');

const getAttempt = async (req, res) => {
  const Attempt = mongoose.model('Attempt');
  const Question = mongoose.model('Question');

  const attempt = await Attempt.findOne({
    _id: req.params.attemptId,
    student: req.student._id,
    removed: false,
  }).exec();

  if (!attempt) {
    return res.status(404).json({ success: false, result: null, message: 'Natija topilmadi.' });
  }

  const questionIds = attempt.answers.map((a) => a.question);
  const questions = await Question.find({ _id: { $in: questionIds } }).exec();
  const questionsById = new Map(questions.map((q) => [String(q._id), q]));

  // Already submitted, so it's now safe to reveal correct answers/options
  // alongside what the student actually picked.
  const answers = attempt.answers.map((a) => {
    const question = questionsById.get(String(a.question));
    return {
      ...a.toObject(),
      question: question
        ? {
            _id: question._id,
            prompt: question.prompt,
            imageUrl: question.imageUrl,
            questionType: question.questionType,
            options: question.options,
            explanation: question.explanation,
            correctAnswerText: question.correctAnswerText,
          }
        : null,
    };
  });

  return res.status(200).json({
    success: true,
    result: { ...attempt.toObject(), answers },
    message: 'Natija',
  });
};

module.exports = getAttempt;
