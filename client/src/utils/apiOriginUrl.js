import axios from "axios";

/** Origin API (Render/local). Rỗng = dùng proxy Vite hoặc cùng host. */
export function getApiOrigin() {
  return String(import.meta.env.VITE_API_ORIGIN || "")
    .trim()
    .replace(/\/$/, "");
}

/**
 * URL đầy đủ cho /api/... và /uploads/...
 * Khi VITE_API_ORIGIN set: gọi thẳng backend (production).
 * Khi để trống: đường dẫn tương đối (dev proxy).
 */
export function apiOriginUrl(path) {
  const p = path.startsWith("/") ? path : `/${path}`;
  const origin = getApiOrigin();
  if (!origin) return p;
  return `${origin}${p}`;
}

/** Gắn baseURL cho mọi axios.get/post... — gọi một lần trong main.jsx */
export function setupApiClient() {
  const origin = getApiOrigin();
  if (origin) {
    axios.defaults.baseURL = origin;
  }
}

/** fetch() tới API — luôn qua apiOriginUrl */
export function apiFetch(path, init) {
  return fetch(apiOriginUrl(path), init);
}

/** Ảnh /uploads/... từ API khi chưa có URL tuyệt đối */
export function resolveAssetUrl(url) {
  if (!url) return "";
  const s = String(url).trim();
  if (/^https?:\/\//i.test(s)) return s;
  return apiOriginUrl(s.startsWith("/") ? s : `/${s}`);
}
