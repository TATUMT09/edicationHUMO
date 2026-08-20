const mongoose = require('mongoose');

const logout = async (req, res, { userModel }) => {
  const UserPassword = mongoose.model(userModel + 'Password');
  const currentUser = req[userModel.toLowerCase()];

  // const token = req.cookies[`token_${cloud._id}`];

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extract the token

  if (token)
    await UserPassword.findOneAndUpdate(
      { user: currentUser._id },
      { $pull: { loggedSessions: token } },
      {
        new: true,
      }
    ).exec();
  else
    await UserPassword.findOneAndUpdate(
      { user: currentUser._id },
      { loggedSessions: [] },
      {
        new: true,
      }
    ).exec();

  return res.json({
    success: true,
    result: {},
    message: 'Successfully logout',
  });
};

module.exports = logout;
