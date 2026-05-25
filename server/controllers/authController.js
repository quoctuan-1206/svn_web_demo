const asyncHandler = require('../utils/asyncHandler');
const authService = require('../services/authService');
const { jwtSecret } = require('../config/env');
const { httpError } = require('../utils/httpError');

const login = asyncHandler(async (req, res) => {
  if (!jwtSecret) {
    throw httpError(500, 'JWT_SECRET is not configured');
  }

  const { username, password } = req.body || {};
  if (!username || !password) {
    throw httpError(400, 'Username and password are required');
  }

  const result = await authService.login({
    username: String(username).trim(),
    password: String(password),
    jwtSecret,
  });

  res.json(result);
});

const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});

module.exports = { login, me };
