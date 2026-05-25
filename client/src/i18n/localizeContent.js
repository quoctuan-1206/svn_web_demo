/** Lấy trường nội dung theo locale (title / titleEn, excerpt / excerptEn, …). */
export function localizedField(record, field, locale = "vi") {
  if (!record) return "";
  if (locale === "en") {
    const enKey = `${field}En`;
    const alt = record[enKey] ?? record[`${field}_en`];
    if (alt != null && String(alt).trim()) return String(alt).trim();
  }
  const val = record[field];
  return val == null ? "" : String(val).trim();
}

const LEAD_FIELDS = ["description", "excerpt", "summary", "content"];

function stripHtml(text) {
  return String(text)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Mô tả ngắn (description → excerpt → content). */
export function pickLocalizedLead(record, locale = "vi") {
  if (!record) return "";
  for (const field of LEAD_FIELDS) {
    const raw = localizedField(record, field, locale);
    if (!raw) continue;
    const plain = /<[^>]+>/.test(raw) ? stripHtml(raw) : raw;
    if (plain) return plain;
  }
  return "";
}

/** Gộp các trường text để tìm kiếm (cả VI và EN nếu có). */
export function searchHaystack(record, fields) {
  const parts = [];
  for (const field of fields) {
    parts.push(localizedField(record, field, "vi"));
    parts.push(localizedField(record, field, "en"));
  }
  return parts
    .map((v) => String(v || "").toLowerCase())
    .join(" ");
}
