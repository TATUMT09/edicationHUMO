// Grades a single-/multi-choice/true-false answer by re-deriving correctness
// from the real Question doc — the client's own idea of "correct" (if any)
// is never trusted. Shared by submitAttempt (final scoring) and checkAnswer
// (immediate-feedback mode) so there is exactly one grading rule.
const gradeChoiceAnswer = (question, submittedAnswer) => {
  const correctIds = new Set(
    (question.options || []).filter((opt) => opt.isCorrect).map((opt) => String(opt._id))
  );
  // A malformed request (e.g. selectedOptionIds sent as a string/object
  // instead of an array) must grade as "wrong", never throw — an uncaught
  // TypeError here would 500 and leak internal error details to the client.
  const rawSelected = Array.isArray(submittedAnswer?.selectedOptionIds)
    ? submittedAnswer.selectedOptionIds
    : [];
  const selectedIds = new Set(rawSelected.map(String));

  const isCorrect =
    correctIds.size > 0 &&
    correctIds.size === selectedIds.size &&
    [...correctIds].every((id) => selectedIds.has(id));

  return { isCorrect, pointsAwarded: isCorrect ? question.points || 1 : 0 };
};

module.exports = gradeChoiceAnswer;
