/**
 * Duong dan chi tiet: uu tien slug, fallback Mongo id.
 */
export function catalogItemPath(item) {
  const id = item?._id || item?.id;
  const slug = item?.slug;
  const base = item?.category === "solution" ? "/giai-phap" : "/san-pham";
  const segment = slug || id;
  if (!segment) return base;
  return `${base}/${encodeURIComponent(segment)}`;
}

export function newsArticlePath(item) {
  const id = item?._id || item?.id;
  const slug = item?.slug;
  if (slug) return `/tin-tuc/${encodeURIComponent(slug)}`;
  if (id) return `/tin-tuc/${encodeURIComponent(id)}`;
  return "/tin-tuc";
}
