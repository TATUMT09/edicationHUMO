const mongoose = require('mongoose');

const gradeChoiceAnswer = require('@/utils/gradeChoiceAnswer');
const { verifyTestSession } = require('@/utils/testSessionToken');

// Stateless single-question check for "reveal immediately" mode. Loads the
// real Question and returns only whether the submitted selection was
// correct — never the correct option ids/text — so a student probing this
// endpoint can learn the correctness of what they actually chose, one
// question at a time, but can never harvest the full answer key. Nothing is
// persisted here; final scoring/stars still happen exclusively through
// submitAttempt.
//
// Requires the same signed sessionToken as submitAttempt, and only accepts
// questionIds that are actually in that session. Without this, a logged-in
// student could call this endpoint for arbitrary questionIds from a test
// they never started, script through every option, and reconstruct the
// entire answer key from the isCorrect responses — exactly what the "never
// send the correct option to the client" design is trying to prevent. It
// also closes a NoSQL-injection path: questionId is now checked against a
// small known-good list before it ever reaches a Mongo query, instead of
// being used directly as an _id filter.
const checkAnswer = async (req, res) => {
  const Question = mongoose.model('Question');

  const { testId } = req.params;
  const { questionId, selectedOptionIds, sessionToken } = req.body;

  const session = verifyTestSession(sessionToken, { studentId: req.student._id, testId });
  if (!session) {
    return res.status(400).json({
      success: false,
      result: null,
      message: "Test sessiyasi eskirgan. Iltimos, testni qaytadan boshlang.",
    });
  }
  if (typeof questionId !== 'string' || !session.questionIds.includes(questionId)) {
    return res.status(404).json({ success: false, result: null, message: 'Savol topilmadi.' });
  }

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
