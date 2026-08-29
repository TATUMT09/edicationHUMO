const mongoose = require('mongoose');

// Reception/entrance kiosk needs to see every enrolled child across every
// group at once (unlike a teacher's own-group-only attendance view), so
// this deliberately does not use getTeacherGroupId scoping.
const faceRoster = async (req, res) => {
  const Client = mongoose.model('Client');

  const clients = await Client.find({
    removed: false,
    enabled: true,
    faceDescriptor: { $exists: true, $ne: [] },
  })
    .select('name photo faceDescriptor group')
    .exec();

  return res.status(200).json({
    success: true,
    result: clients,
    message: 'Ro\'yxat',
  });
};

module.exports = faceRoster;
