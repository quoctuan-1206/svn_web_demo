const cors = require('cors');

const LOCAL_ORIGINS = new Set(['http://localhost:5173', 'http://127.0.0.1:5173']);
const LOCAL_ORIGIN_RE = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/;

function deployedOrigins() {
  const raw = process.env.CLIENT_ORIGIN || process.env.CORS_ORIGINS || '';
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

const DEPLOYED_ORIGINS = new Set(deployedOrigins());

function corsOrigin(origin, callback) {
  if (!origin) return callback(null, true);
  if (LOCAL_ORIGINS.has(origin) || LOCAL_ORIGIN_RE.test(origin)) {
    return callback(null, true);
  }
  if (DEPLOYED_ORIGINS.has(origin)) {
    return callback(null, true);
  }
  return callback(new Error(`CORS blocked for origin: ${origin}`));
}

module.exports = cors({ origin: corsOrigin, credentials: true });
