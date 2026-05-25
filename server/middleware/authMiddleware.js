const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { jwtSecret } = require('../config/env');
const { httpError } = require('../utils/httpError');

function getBearerToken(req) {
  const header = req.headers.authorization;
  if (!header || typeof header !== 'string') return null;
  const [scheme, token] = header.split(' ');
  if (!scheme || scheme.toLowerCase() !== 'bearer' || !token) return null;
  return token.trim();
}

async function tryAuth(req) {
  if (!jwtSecret) return null;
  const token = getBearerToken(req);
  if (!token) return null;

  try {
    const payload = jwt.verify(token, jwtSecret);
    const userId = payload.sub || payload.userId || payload.id;
    if (!userId) return null;
    const user = await User.findById(userId).select('-password').lean();
    return user || null;
  } catch {
    return null;
  }
}

async function authMiddleware(req, res, next) {
  try {
    if (!jwtSecret) {
      throw httpError(500, 'JWT_SECRET is not configured');
    }

    const user = await tryAuth(req);
    if (!user) {
      throw httpError(401, 'Unauthorized');
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = authMiddleware;
module.exports.tryAuth = tryAuth;
