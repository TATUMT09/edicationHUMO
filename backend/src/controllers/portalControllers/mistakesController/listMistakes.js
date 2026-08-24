const mongoose = require('mongoose');

// "Mening xatolarim" — every question the student has ever gotten wrong,
// deduped to its most recent occurrence, grouped by subject. This is the
// student's own already-graded history (the exact same data getAttempt.js
// already exposes per-attempt) so revealing the correct option/explanation
// here isn't a new security boundary.
const listMistakes = async (req, res) => {
  const Attempt = mongoose.model('Attempt');
  const Question = mongoose.model('Question');

  const wrong = await Attempt.aggregate([
    { $match: { student: req.student._id, removed: false } },
    { $unwind: '$answers' },
    { $match: { 'answers.isCorrect': false } },
    { $sort: { submittedAt: -1 } },
    {
      $group: {
        _id: '$answers.question',
        subject: { $first: '$subject' },
        selectedOptionIds: { $first: '$answers.selectedOptionIds' },
        freeTextAnswer: { $first: '$answers.freeTextAnswer' },
        teacherComment: { $first: '$answers.teacherComment' },
        lastMissedAt: { $first: '$submittedAt' },
      },
    },
  ]);

  if (wrong.length === 0) {
    return res.status(200).json({ success: true, result: { bySubject: [] }, message: 'OK' });
  }

  const questionIds = wrong.map((w) => w._id);
  const questions = await Question.find({ _id: { $in: questionIds }, removed: false }).exec();
  const questionById = new Map(questions.map((q) => [String(q._id), q]));

  const groups = new Map(); // subjectId -> { subject, items: [] }
  for (const w of wrong) {
    const question = questionById.get(String(w._id));
    if (!question) continue;

    const subjectId = w.subject ? String(w.subject) : 'other';
    if (!groups.has(subjectId)) {
      groups.set(subjectId, { subjectId: w.subject, items: [] });
    }
    groups.get(subjectId).items.push({
      question,
      selectedOptionIds: w.selectedOptionIds || [],
      freeTextAnswer: w.freeTextAnswer || '',
      teacherComment: w.teacherComment || '',
      lastMissedAt: w.lastMissedAt,
    });
  }

  const Subject = mongoose.model('Subject');
  const subjectIds = [...groups.keys()].filter((id) => id !== 'other');
  const subjects = await Subject.find({ _id: { $in: subjectIds } }).exec();
  const subjectById = new Map(subjects.map((s) => [String(s._id), s]));

  const bySubject = [...groups.entries()].map(([subjectId, group]) => ({
    subject: subjectById.get(subjectId) || null,
    items: group.items,
  }));

  return res.status(200).json({ success: true, result: { bySubject }, message: 'OK' });
};

module.exports = listMistakes;
