// Grades a single-/multi-choice/true-false answer by re-deriving correctness
// from the real Question doc — the client's own idea of "correct" (if any)
// is never trusted. Shared by submitAttempt (final scoring) and checkAnswer
// (immediate-feedback mode) so there is exactly one grading rule.
const gradeChoiceAnswer = (question, submittedAnswer) => {
  const correctIds = new Set(
    (question.options || []).filter((opt) => opt.isCorrect).map((opt) => String(opt._id))
  );
  const selectedIds = new Set((submittedAnswer?.selectedOptionIds || []).map(String));

  const isCorrect =
    correctIds.size > 0 &&
    correctIds.size === selectedIds.size &&
    [...correctIds].every((id) => selectedIds.has(id));

  return { isCorrect, pointsAwarded: isCorrect ? question.points || 1 : 0 };
};

module.exports = gradeChoiceAnswer;
