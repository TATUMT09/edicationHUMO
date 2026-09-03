const mongoose = require('mongoose');

// Returns the id (string) of the group this admin teaches.
// - undefined: admin is not a teacher (e.g. owner/director) -> no restriction
// - null: admin is a teacher but has no group assigned -> should see nothing
// - string: the single group id this teacher is restricted to
async function getTeacherGroupId(admin) {
  if (!admin || admin.role !== 'teacher') return undefined;
  const Group = mongoose.model('Group');
  const group = await Group.findOne({ teacher: admin._id, removed: false });
  return group ? String(group._id) : null;
}

// Returns the id (string) of the subject this admin teaches.
// - undefined: admin is not a teacher (e.g. owner/director) -> no restriction
// - null: admin is a teacher but has no subject assigned -> should see nothing
// - string: the single subject id this teacher is restricted to
function getTeacherSubjectId(admin) {
  if (!admin || admin.role !== 'teacher') return undefined;
  return admin.subject ? String(admin.subject) : null;
}

module.exports = { getTeacherGroupId, getTeacherSubjectId };
