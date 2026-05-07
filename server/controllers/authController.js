const authService = require('../services/authService');

async function login(req, res) {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ message: 'JWT_SECRET is not configured' });
    }

    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const result = await authService.login({
      username: String(username).trim(),
      password: String(password),
      jwtSecret: secret,
    });

    return res.json(result);
  } catch (err) {
    const status = err?.statusCode || 500;
    return res.status(status).json({ message: err.message || 'Login failed' });
  }
}

function me(req, res) {
  return res.json({ user: req.user });
}

module.exports = { login, me };

