/**
 * Khi để trống: dùng đường dẫn tương đối (Vite `server.proxy` / `preview.proxy` hoặc app cùng host với API).
 * Khi set `VITE_API_ORIGIN` (vd. http://127.0.0.1:3001): gọi thẳng backend — hữu ích khi `vite preview` hoặc môi trường không proxy được /api.
 */
export function apiOriginUrl(path) {
  const p = path.startsWith("/") ? path : `/${path}`;
  const origin = String(import.meta.env.VITE_API_ORIGIN || "")
    .trim()
    .replace(/\/$/, "");
  if (!origin) return p;
  return `${origin}${p}`;
}
