require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });
const dns = require('dns');
const { globSync } = require('glob');
const fs = require('fs');
const { generate: uniqueId } = require('shortid');

dns.setServers(['8.8.8.8', '1.1.1.1']);

const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE);

async function setupApp() {
  try {
    const Admin = require('../models/coreModels/Admin');
    const AdminPassword = require('../models/coreModels/AdminPassword');

    const defaultAdmins = [
      { email: 'sunnatovasadbek004@gmail.com', name: 'Asadbek', surname: 'Sunnatov' },
      { email: 'sunnatovasadbek917@gmail.com', name: 'Asadbek', surname: 'Sunnatov' },
    ];
    const defaultPassword = 'AD0187221';

    for (const adminData of defaultAdmins) {
      const result = await new Admin({
        ...adminData,
        enabled: true,
        role: 'owner',
      }).save();

      const newAdminPassword = new AdminPassword();
      const salt = uniqueId();
      const passwordHash = newAdminPassword.generateHash(salt, defaultPassword);

      await new AdminPassword({
        password: passwordHash,
        emailVerified: true,
        salt: salt,
        user: result._id,
      }).save();
    }

    console.log('👍 Admin created : Done!');

    const Setting = require('../models/coreModels/Setting');

    const settingFiles = [];

    const settingsFiles = globSync('./src/setup/defaultSettings/**/*.json');

    for (const filePath of settingsFiles) {
      const file = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      settingFiles.push(...file);
    }

    await Setting.insertMany(settingFiles);

    console.log('👍 Settings created : Done!');

    console.log('🥳 Setup completed :Success!');
    process.exit();
  } catch (e) {
    console.log('\n🚫 Error! The Error info is below');
    console.log(e);
    process.exit();
  }
}

setupApp();
