const mongoose = require('mongoose');
const { getTeacherSubjectId } = require('@/utils/teacherScope');

const confirmImport = async (req, res) => {
  const Test = mongoose.model('Test');
  const Question = mongoose.model('Question');
  const Subject = mongoose.model('Subject');

  const { title, level, testType, questions } = req.body;
  let { subject } = req.body;

  // A teacher can only import into their own subject, regardless of what
  // was picked/sent from the client (mirrors testController.create).
  const teacherSubjectId = getTeacherSubjectId(req.admin);
  if (teacherSubjectId === null) {
    return res.status(403).json({
      success: false,
      result: null,
      message: "Sizga hali fan biriktirilmagan. Administratorga murojaat qiling.",
    });
  }
  if (teacherSubjectId) subject = teacherSubjectId;

  if (!title || !subject || !level || !testType) {
    return res.status(409).json({
      success: false,
      result: null,
      message: "Sarlavha, fan, daraja va test turi to'ldirilishi shart.",
    });
  }

  if (!Array.isArray(questions) || questions.length === 0) {
    return res.status(409).json({
      success: false,
      result: null,
      message: "Kamida bitta savol bo'lishi kerak.",
    });
  }

  const subjectDoc = await Subject.findOne({ _id: subject, removed: false }).exec();
  if (!subjectDoc) {
    return res.status(404).json({ success: false, result: null, message: 'Fan topilmadi.' });
  }

  const test = await new Test({
    subject: subjectDoc._id,
    level,
    testType,
    title,
    enabled: true,
  }).save();

  const questionDocs = await Question.insertMany(
    questions.map((q, index) => ({
      test: test._id,
      order: index + 1,
      prompt: q.prompt,
      questionType: q.questionType,
      options: q.questionType === 'open_response' ? [] : q.options || [],
      correctAnswerText: q.questionType === 'open_response' ? q.correctAnswerText || '' : undefined,
      points: q.points || 1,
    }))
  );

  return res.status(200).json({
    success: true,
    result: { test, questionsCreated: questionDocs.length },
    message: `Test va ${questionDocs.length} ta savol muvaffaqiyatli yaratildi.`,
  });
};

module.exports = confirmImport;
