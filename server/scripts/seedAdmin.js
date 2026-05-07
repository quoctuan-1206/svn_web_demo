require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'svn@2025';
const SALT_ROUNDS = 10;

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is not set');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('MongoDB connected');

  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, SALT_ROUNDS);

  const existing = await User.findOne({ username: ADMIN_USERNAME });
  if (existing) {
    console.log(`User "${ADMIN_USERNAME}" already exists`);
    await mongoose.disconnect();
    process.exit(0);
    return;
  }

  await User.create({
    username: ADMIN_USERNAME,
    password: hashedPassword,
    role: 'admin',
  });

  console.log(`Created admin user "${ADMIN_USERNAME}"`);
  await mongoose.disconnect();
  process.exit(0);
}

main().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
