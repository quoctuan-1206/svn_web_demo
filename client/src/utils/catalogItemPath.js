/** Đường dẫn chi tiết sản phẩm / giải pháp: ưu tiên slug, fallback Mongo id. */
export function catalogItemPath(item) {
  const id = item?._id || item?.id;
  const slug = item?.slug;
  const base = item?.category === "solution" ? "/giai-phap" : "/san-pham";
  const segment = slug || id;
  if (!segment) return base;
  return `${base}/${encodeURIComponent(segment)}`;
}
