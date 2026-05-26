const cors = require('cors');

const LOCAL_ORIGINS = new Set([
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
]);
const LOCAL_ORIGIN_RE = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/;
const VERCEL_ORIGIN_RE = /^https:\/\/[a-z0-9-]+\.vercel\.app$/i;

function deployedOrigins() {
  const raw = process.env.CLIENT_ORIGIN || process.env.CORS_ORIGINS || '';
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function corsOrigin(origin, callback) {
  if (!origin) return callback(null, true);

  if (LOCAL_ORIGINS.has(origin) || LOCAL_ORIGIN_RE.test(origin)) {
    return callback(null, true);
  }

  if (VERCEL_ORIGIN_RE.test(origin)) {
    return callback(null, true);
  }

  const allowed = new Set(deployedOrigins());
  if (allowed.has(origin)) {
    return callback(null, true);
  }

  console.warn(`[cors] Blocked origin: ${origin}`);
  return callback(new Error(`CORS blocked for origin: ${origin}`));
}

module.exports = cors({ origin: corsOrigin, credentials: true });
