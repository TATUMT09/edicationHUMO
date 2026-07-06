// Standalone script to add (or reset the password of) an admin user.
// Usage:
//   node adduser.js <email> <name> <password> [surname]
//
// Example:
//   node adduser.js sardor@example.com Sardor parol12345
//
// Run this from inside the backend/ folder (where package.json lives) —
// it needs backend/.env for the database connection string.

require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });

const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const mongoose = require('mongoose');
const { generate: uniqueId } = require('shortid');

const [, , email, name, password, surname] = process.argv;

if (!email || !name || !password) {
  console.log('Foydalanish: node adduser.js <email> <ism> <parol> [familiya]');
  console.log('Masalan:     node adduser.js sardor@example.com Sardor parol12345');
  process.exit(1);
}

async function addUser() {
  await mongoose.connect(process.env.DATABASE);

  const Admin = require('./src/models/coreModels/Admin');
  const AdminPassword = require('./src/models/coreModels/AdminPassword');

  const salt = uniqueId();
  const tmp = new AdminPassword();
  const passwordHash = tmp.generateHash(salt, password);

  let admin = await Admin.findOne({ email: email.toLowerCase() });

  if (admin) {
    await AdminPassword.findOneAndUpdate(
      { user: admin._id },
      { password: passwordHash, salt },
      { upsert: true }
    );
    console.log(`👍 "${email}" uchun parol yangilandi.`);
  } else {
    admin = await new Admin({
      email: email.toLowerCase(),
      name,
      surname: surname || '',
      enabled: true,
      role: 'owner',
    }).save();

    await new AdminPassword({
      user: admin._id,
      password: passwordHash,
      salt,
      emailVerified: true,
    }).save();

    console.log(`👍 Yangi foydalanuvchi yaratildi: ${email}`);
  }

  process.exit(0);
}

addUser().catch((error) => {
  console.error('🚫 Xatolik:', error.message);
  process.exit(1);
});
