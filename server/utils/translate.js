const { translate } = require('google-translate-api-x');

const MAX_CHUNK = 4500;

function stripHtml(html) {
  return String(html || '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function plainToHtmlParagraphs(text) {
  const blocks = String(text || '')
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (!blocks.length) return '';
  return blocks.map((p) => `<p>${escapeHtml(p)}</p>`).join('');
}

async function translateChunk(text, { from, to }) {
  const res = await translate(text, { from, to, autoCorrect: false });
  return String(res?.text || '').trim();
}

/**
 * Dịch văn bản (chia nhỏ nếu dài). Trả về '' nếu lỗi hoặc rỗng.
 */
async function translateText(text, { from = 'vi', to = 'en' } = {}) {
  const raw = String(text || '').trim();
  if (!raw) return '';

  if (raw.length <= MAX_CHUNK) {
    return translateChunk(raw, { from, to });
  }

  const parts = [];
  let cursor = 0;
  while (cursor < raw.length) {
    parts.push(raw.slice(cursor, cursor + MAX_CHUNK));
    cursor += MAX_CHUNK;
  }

  const out = [];
  for (const part of parts) {
    out.push(await translateChunk(part, { from, to }));
  }
  return out.join(' ').trim();
}

/** HTML từ editor → dịch nội dung, lưu lại dạng đoạn <p> đơn giản. */
async function translateRichContent(html, options) {
  const raw = String(html || '').trim();
  if (!raw) return '';
  if (!/<[a-z][\s\S]*>/i.test(raw)) {
    return translateText(raw, options);
  }
  const plain = stripHtml(raw);
  const translated = await translateText(plain, options);
  return plainToHtmlParagraphs(translated);
}

function shouldAutoTranslate(body) {
  if (body?.autoTranslateEn === 'false' || body?.autoTranslateEn === false) {
    return false;
  }
  if (body?.autoTranslateEn === 'true' || body?.autoTranslateEn === true) {
    return true;
  }
  const env = require('../config/env');
  return env.autoTranslateEn;
}

/**
 * @param {{ title?: string, excerpt?: string, content?: string, description?: string }} fields
 */
async function buildEnglishFields(fields, { enabled = true } = {}) {
  if (!enabled) return {};

  try {
    const [titleEn, excerptEn, descriptionEn, contentEn] = await Promise.all([
      translateText(fields.title),
      translateText(fields.excerpt),
      translateText(fields.description),
      translateRichContent(fields.content),
    ]);

    const out = {};
    if (titleEn) out.titleEn = titleEn;
    if (excerptEn) out.excerptEn = excerptEn;
    if (descriptionEn) out.descriptionEn = descriptionEn;
    if (contentEn) out.contentEn = contentEn;
    return out;
  } catch (err) {
    console.warn('[translate] Auto EN failed:', err?.message || err);
    return {};
  }
}

module.exports = {
  translateText,
  translateRichContent,
  buildEnglishFields,
  shouldAutoTranslate,
};
