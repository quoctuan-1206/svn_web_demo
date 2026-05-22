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
  return d.toLocaleDateString("vi-VN", {
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
    title: payload.title || "Không có tiêu đề",
    date: formatPdfDate(payload.date),
    excerpt: String(payload.excerpt || "").trim(),
    body: String(payload.body || "").trim(),
    filename: `${slugifyFilename(payload.filename)}.pdf`,
  };
}

export function pdfPayloadFromProduct(item, variant = "product") {
  const isSolution = variant === "solution" || item?.category === "solution";
  const body =
    String(item?.content || "").trim() ||
    String(item?.description || "").trim();

  return buildPdfDocument({
    typeLabel: isSolution ? "Giải pháp" : "Sản phẩm",
    title: item?.title,
    date: item?.updatedAt || item?.createdAt,
    excerpt: item?.excerpt || item?.description,
    body,
    filename: item?.slug || item?.title || "san-pham",
  });
}

export function pdfPayloadFromNews(item) {
  return buildPdfDocument({
    typeLabel: "Tin tức",
    title: item?.title,
    date: item?.publishedAt || item?.date || item?.createdAt,
    excerpt: item?.excerpt,
    body: item?.content,
    filename: item?.slug || item?.title || "tin-tuc",
  });
}
