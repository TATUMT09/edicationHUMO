const mongoose = require('mongoose');
const { generate: uniqueId } = require('shortid');

const ownerOnly = (req, res) => {
  if (req.admin?.role === 'teacher') {
    res.status(403).json({
      success: false,
      result: null,
      message: "Bu amal faqat administratorlar uchun ruxsat etilgan",
    });
    return true;
  }
  return false;
};

const list = async (req, res) => {
  if (ownerOnly(req, res)) return;

  const Admin = mongoose.model('Admin');
  const admins = await Admin.find({ removed: false }, '-photo')
    .populate('subject')
    .sort({ created: -1 });
  return res.status(200).json({ success: true, result: admins, message: 'Successfully found' });
};

const create = async (req, res) => {
  if (ownerOnly(req, res)) return;

  const { email, name, surname, password, role, subject } = req.body;
  if (!email || !name || !password) {
    return res.status(400).json({
      success: false,
      result: null,
      message: 'Ism, email va parol kiritilishi shart',
    });
  }

  const Admin = mongoose.model('Admin');
  const AdminPassword = mongoose.model('AdminPassword');

  const existing = await Admin.findOne({ email: email.toLowerCase(), removed: false });
  if (existing) {
    return res.status(409).json({
      success: false,
      result: null,
      message: 'Bu email bilan foydalanuvchi allaqachon mavjud',
    });
  }

  const admin = await new Admin({
    email: email.toLowerCase(),
    name,
    surname: surname || '',
    role: role === 'owner' ? 'owner' : 'teacher',
    subject: role === 'owner' ? undefined : subject || undefined,
    enabled: true,
  }).save();

  const salt = uniqueId();
  const tmp = new AdminPassword();
  const passwordHash = tmp.generateHash(salt, password);
  await new AdminPassword({
    user: admin._id,
    password: passwordHash,
    salt,
    emailVerified: true,
  }).save();

  return res.status(200).json({ success: true, result: admin, message: 'Xodim yaratildi' });
};

const update = async (req, res) => {
  if (ownerOnly(req, res)) return;

  const { name, surname, role, password, enabled, subject } = req.body;
  const Admin = mongoose.model('Admin');
  const AdminPassword = mongoose.model('AdminPassword');

  const admin = await Admin.findOneAndUpdate(
    { _id: req.params.id, removed: false },
    {
      ...(name !== undefined && { name }),
      ...(surname !== undefined && { surname }),
      ...(role !== undefined && { role }),
      ...(enabled !== undefined && { enabled }),
      ...(subject !== undefined && { subject: subject || null }),
      ...(role === 'owner' && { subject: null }),
    },
    { new: true }
  ).populate('subject');

  if (!admin) {
    return res.status(404).json({ success: false, result: null, message: 'Topilmadi' });
  }

  if (password) {
    const salt = uniqueId();
    const tmp = new AdminPassword();
    const passwordHash = tmp.generateHash(salt, password);
    await AdminPassword.findOneAndUpdate(
      { user: admin._id },
      { password: passwordHash, salt },
      { upsert: true }
    );
  }

  return res.status(200).json({ success: true, result: admin, message: 'Yangilandi' });
};

const remove = async (req, res) => {
  if (ownerOnly(req, res)) return;

  if (String(req.admin._id) === String(req.params.id)) {
    return res.status(400).json({
      success: false,
      result: null,
      message: "O'zingizni o'chira olmaysiz",
    });
  }

  const Admin = mongoose.model('Admin');
  const admin = await Admin.findOneAndUpdate(
    { _id: req.params.id, removed: false },
    { removed: true },
    { new: true }
  );

  if (!admin) {
    return res.status(404).json({ success: false, result: null, message: 'Topilmadi' });
  }

  return res.status(200).json({ success: true, result: admin, message: "O'chirildi" });
};

module.exports = { list, create, update, remove };
