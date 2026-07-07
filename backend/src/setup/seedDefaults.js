const { globSync } = require('glob');
const fs = require('fs');
const path = require('path');
const { generate: uniqueId } = require('shortid');

const DEFAULT_ADMINS = [
  { email: 'sunnatovasadbek004@gmail.com', name: 'Asadbek', surname: 'Sunnatov' },
  { email: 'sunnatovasadbek917@gmail.com', name: 'Asadbek', surname: 'Sunnatov' },
];
const DEFAULT_PASSWORD = 'AD0187221';

// Creates the default admin accounts and settings the first time the app
// connects to an empty database (fresh install / fresh deployment), so a
// production server is usable without manually running `npm run setup`.
async function seedDefaults() {
  const Admin = require('@/models/coreModels/Admin');
  const AdminPassword = require('@/models/coreModels/AdminPassword');

  const adminCount = await Admin.countDocuments();
  if (adminCount === 0) {
    for (const adminData of DEFAULT_ADMINS) {
      const result = await new Admin({
        ...adminData,
        enabled: true,
        role: 'owner',
      }).save();

      const newAdminPassword = new AdminPassword();
      const salt = uniqueId();
      const passwordHash = newAdminPassword.generateHash(salt, DEFAULT_PASSWORD);

      await new AdminPassword({
        password: passwordHash,
        emailVerified: true,
        salt: salt,
        user: result._id,
      }).save();
    }
    console.log('👍 Default admins created');
  }

  // Checked independently of admin seeding — the frontend blocks its entire
  // UI behind a successful /setting/listAll response, so a DB that has admins
  // but no settings (e.g. from a prior partial seed) leaves the app stuck on
  // an infinite loading spinner with no visible error.
  const Setting = require('@/models/coreModels/Setting');
  const settingsCount = await Setting.countDocuments();
  if (settingsCount === 0) {
    const settingFiles = [];
    const settingsFiles = globSync(path.join(__dirname, 'defaultSettings/**/*.json'));
    for (const filePath of settingsFiles) {
      const file = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      settingFiles.push(...file);
    }
    if (settingFiles.length > 0) {
      await Setting.insertMany(settingFiles);
      console.log('👍 Default settings created');
    }
  }
}

module.exports = seedDefaults;
