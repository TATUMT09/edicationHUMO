const mongoose = require('mongoose');

const gradeChoiceAnswer = require('@/utils/gradeChoiceAnswer');

// Stateless single-question check for "reveal immediately" mode. Loads the
// real Question and returns only whether the submitted selection was
// correct — never the correct option ids/text — so a student probing this
// endpoint can learn the correctness of what they actually chose, one
// question at a time, but can never harvest the full answer key. Nothing is
// persisted here; final scoring/stars still happen exclusively through
// submitAttempt.
const checkAnswer = async (req, res) => {
  const Question = mongoose.model('Question');

  const { testId } = req.params;
  const { questionId, selectedOptionIds } = req.body;

  const question = await Question.findOne({
    _id: questionId,
    test: testId,
    removed: false,
  }).exec();
  if (!question) {
    return res.status(404).json({ success: false, result: null, message: 'Savol topilmadi.' });
  }
  if (question.questionType === 'open_response') {
    return res.status(400).json({
      success: false,
      result: null,
      message: "Ochiq savollar darhol tekshirilmaydi.",
    });
  }

  const { isCorrect } = gradeChoiceAnswer(question, { selectedOptionIds });

  return res.status(200).json({ success: true, result: { isCorrect }, message: 'OK' });
};

module.exports = checkAnswer;
