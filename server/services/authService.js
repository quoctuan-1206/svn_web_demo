const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { httpError } = require('../utils/httpError');

const JWT_EXPIRES_IN = '24h';

async function login({ username, password, jwtSecret }) {
  const user = await User.findOne({ username });
  if (!user) throw httpError(401, 'Invalid credentials');

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) throw httpError(401, 'Invalid credentials');

  const token = jwt.sign(
    {
      sub: user._id.toString(),
      username: user.username,
      role: user.role,
    },
    jwtSecret,
    { expiresIn: JWT_EXPIRES_IN },
  );

  return { token, user: user.toJSON() };
}

module.exports = { login };
