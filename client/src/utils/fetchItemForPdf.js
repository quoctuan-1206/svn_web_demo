import axios from "axios";

/** Lấy bản đầy đủ (có content) trước khi xuất PDF. */
export async function fetchItemForPdf(item, kind) {
  if (!item) return null;

  const hasBody =
    String(item.content || "").trim() ||
    String(item.description || "").trim();
  if (hasBody) return item;

  const slug = item.slug;
  const id = item._id || item.id;
  const param = slug || id;
  if (!param) return item;

  try {
    if (kind === "news") {
      const res = await axios.get(`/api/news/${encodeURIComponent(param)}`);
      return res.data || item;
    }
    const res = await axios.get(`/api/products/${encodeURIComponent(param)}`);
    return res.data || item;
  } catch {
    return item;
  }
}
