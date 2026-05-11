/** Đường dẫn chi tiết tin: ưu tiên slug, fallback Mongo id. */
export function newsArticlePath(item) {
  const id = item?._id || item?.id;
  const slug = item?.slug;
  if (slug) return `/tin-tuc/${encodeURIComponent(slug)}`;
  if (id) return `/tin-tuc/${encodeURIComponent(id)}`;
  return "/tin-tuc";
}
