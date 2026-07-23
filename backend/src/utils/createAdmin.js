const bcrypt = require('bcryptjs');

const Admin = require('../models/Admin');

const createAdmin = async () => {
  const exists = await Admin.findOne({
    email: 'admin@nexora.com',
  });

  if (exists) return;

  const password = await bcrypt.hash('Admin@123', 10);

  await Admin.create({
    fullName: 'Super Admin',
    email: 'admin@nexora.com',
    password,
  });

  console.log('Default Admin Created');
};

module.exports = createAdmin;