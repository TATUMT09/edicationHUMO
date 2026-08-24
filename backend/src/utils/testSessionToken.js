const jwt = require('jsonwebtoken');

// Since getTestToTake now serves a random SUBSET of a test's question bank
// (student-chosen count tier), submitAttempt can no longer just grade
// against "every Question belonging to this Test" — it has to grade against
// exactly the questions that were actually shown for this attempt, no more
// and no fewer. A signed token carrying that exact id list closes two
// problems at once: it stops maxScore from silently including questions the
// student never saw, and it stops a client from tampering with which
// questions "count" to game their score (the list is signed, so it can only
// be the one the server actually generated).
const signTestSession = ({ studentId, testId, questionIds }) =>
  jwt.sign({ studentId: String(studentId), testId: String(testId), questionIds }, process.env.JWT_SECRET, {
    expiresIn: '4h',
  });

// Returns the decoded payload, or null if the token is missing/invalid/
// expired, or doesn't match the student+test making the submission.
const verifyTestSession = (token, { studentId, testId }) => {
  if (!token) return null;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.studentId !== String(studentId) || payload.testId !== String(testId)) {
      return null;
    }
    return payload;
  } catch (err) {
    return null;
  }
};

module.exports = { signTestSession, verifyTestSession };
