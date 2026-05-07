function parseBool(val, defaultVal) {
  if (val === undefined || val === null || val === '') return defaultVal;
  if (typeof val === 'boolean') return val;
  return String(val).toLowerCase() === 'true';
}

function parseNumber(val, defaultVal) {
  if (val === undefined || val === null || val === '') return defaultVal;
  const n = Number(val);
  return Number.isFinite(n) ? n : defaultVal;
}

module.exports = { parseBool, parseNumber };

