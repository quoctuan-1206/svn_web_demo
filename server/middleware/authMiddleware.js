const jwt = require('jsonwebtoken');
const User = require('../models/User');

function getBearerToken(req) {
  const header = req.headers.authorization;
  if (!header || typeof header !== 'string') return null;
  const [scheme, token] = header.split(' ');
  if (!scheme || scheme.toLowerCase() !== 'bearer' || !token) return null;
  return token.trim();
}

async function tryAuth(req) {
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;
  const token = getBearerToken(req);
  if (!token) return null;

  try {
    const payload = jwt.verify(token, secret);
    const userId = payload.sub || payload.userId || payload.id;
    if (!userId) return null;
    const user = await User.findById(userId).select('-password').lean();
    return user || null;
  } catch {
    return null;
  }
}

async function authMiddleware(req, res, next) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ message: 'JWT_SECRET is not configured' });
  }

  const user = await tryAuth(req);
  if (!user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  req.user = user;
  next();
}

module.exports = authMiddleware;
module.exports.tryAuth = tryAuth;
