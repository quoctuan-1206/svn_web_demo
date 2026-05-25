import i18n from "../i18n";
import { localizedField } from "../i18n/localizeContent";

export function slugifyFilename(value) {
  return String(value ?? "tai-lieu")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "tai-lieu";
}

function formatPdfDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const locale = i18n.language === "en" ? "en-US" : "vi-VN";
  return d.toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * @param {{
 *   typeLabel: string,
 *   title: string,
 *   date?: string|Date,
 *   excerpt?: string,
 *   body?: string,
 *   filename: string,
 * }} payload
 */
export function buildPdfDocument(payload) {
  return {
    typeLabel: payload.typeLabel,
    title: payload.title || i18n.t("common.untitled"),
    date: formatPdfDate(payload.date),
    excerpt: String(payload.excerpt || "").trim(),
    body: String(payload.body || "").trim(),
    filename: `${slugifyFilename(payload.filename)}.pdf`,
  };
}

export function pdfPayloadFromProduct(item, variant = "product") {
  const isSolution = variant === "solution" || item?.category === "solution";
  const locale = i18n.language === "en" ? "en" : "vi";
  const body =
    localizedField(item, "content", locale) ||
    localizedField(item, "description", locale);

  return buildPdfDocument({
    typeLabel: i18n.t(isSolution ? "catalog.solution" : "catalog.product"),
    title: localizedField(item, "title", locale),
    date: item?.updatedAt || item?.createdAt,
    excerpt:
      localizedField(item, "excerpt", locale) ||
      localizedField(item, "description", locale),
    body,
    filename: item?.slug || item?.title || "san-pham",
  });
}

export function pdfPayloadFromNews(item) {
  const locale = i18n.language === "en" ? "en" : "vi";
  return buildPdfDocument({
    typeLabel: i18n.t("catalog.news"),
    title: localizedField(item, "title", locale),
    date: item?.publishedAt || item?.date || item?.createdAt,
    excerpt: localizedField(item, "excerpt", locale),
    body: localizedField(item, "content", locale),
    filename: item?.slug || item?.title || "tin-tuc",
  });
}
