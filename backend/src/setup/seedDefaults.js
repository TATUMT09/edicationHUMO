const { globSync } = require('glob');
const fs = require('fs');
const path = require('path');
const { generate: uniqueId } = require('shortid');

const DEFAULT_ADMINS = [
  { email: 'sunnatovasadbek004@gmail.com', name: 'Asadbek', surname: 'Sunnatov' },
  { email: 'sunnatovasadbek917@gmail.com', name: 'Asadbek', surname: 'Sunnatov' },
];
const DEFAULT_PASSWORD = 'AD0187221';

const DEFAULT_SUBJECTS = ['Matematika', 'Biologiya', 'SAT', 'Kimyo', 'Huquq', 'Ingliz tili'];

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

  // Checked independently (own settingCategory) so it seeds even on a DB
  // that already has app_settings from before the gamification layer existed.
  const portalStarSettingCount = await Setting.countDocuments({
    settingCategory: 'portal_settings',
  });
  if (portalStarSettingCount === 0) {
    await Setting.insertMany([
      {
        settingCategory: 'portal_settings',
        settingKey: 'portal_correct_answer_stars',
        settingValue: 10,
        valueType: 'number',
      },
      {
        settingCategory: 'portal_settings',
        settingKey: 'portal_perfect_score_bonus',
        settingValue: 50,
        valueType: 'number',
      },
    ]);
    console.log('👍 Default portal star settings created');
  }

  const Subject = require('@/models/appModels/Subject');
  const subjectCount = await Subject.countDocuments();
  if (subjectCount === 0) {
    await Subject.insertMany(
      DEFAULT_SUBJECTS.map((name, index) => ({
        name,
        slug: name
          .toLowerCase()
          .replace(/['`]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, ''),
        order: index,
      }))
    );
    console.log('👍 Default subjects created');
  }
}

module.exports = seedDefaults;
