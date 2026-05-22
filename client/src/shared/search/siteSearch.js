import { catalogItemPath, newsArticlePath } from "../../utils/contentPaths";

/** Trang & mục cố định trong dự án */
export const STATIC_SEARCH_ENTRIES = [
  { id: "home", type: "page", label: "Trang chủ", to: "/", sectionId: null },
  {
    id: "overview",
    type: "page",
    label: "Tổng quan",
    to: "/tong-quan",
    sectionId: null,
    extra: "tong quan svn automation",
  },
  {
    id: "about",
    type: "page",
    label: "Về chúng tôi",
    to: "/ve-chung-toi",
    sectionId: null,
    extra: "gioi thieu about",
  },
  {
    id: "products",
    type: "page",
    label: "Sản phẩm",
    to: "/san-pham",
    sectionId: "san-pham",
    extra: "san pham catalog",
  },
  {
    id: "solutions",
    type: "page",
    label: "Giải pháp",
    to: "/giai-phap",
    sectionId: "giai-phap",
    extra: "giai phap automation",
  },
  {
    id: "partners",
    type: "page",
    label: "Đối tác",
    to: "/doi-tac",
    sectionId: "doi-tac",
    extra: "doi tac partner",
  },
  {
    id: "news",
    type: "page",
    label: "Tin tức",
    to: "/tin-tuc",
    sectionId: "tin-tuc",
    extra: "tin tuc news",
  },
  {
    id: "download",
    type: "page",
    label: "Tải về",
    to: "/tai-ve",
    sectionId: null,
    extra: "tai ve download tai lieu",
  },
  {
    id: "global",
    type: "page",
    label: "Hiện diện toàn cầu",
    to: "/hien-dien-toan-cau",
    sectionId: null,
    extra: "global presence",
  },
  {
    id: "services",
    type: "page",
    label: "Dịch vụ & Hỗ trợ",
    to: "/dich-vu-ho-tro",
    sectionId: null,
    extra: "dich vu ho tro support",
  },
  {
    id: "contact",
    type: "page",
    label: "Liên hệ",
    to: "/lien-he",
    sectionId: "lien-he",
    extra: "lien he contact form",
  },
];

const TYPE_LABELS = {
  page: "Trang",
  product: "Sản phẩm",
  solution: "Giải pháp",
  news: "Tin tức",
};

export function normalizeSearchText(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function stripHtml(html) {
  return String(html ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function truncateText(text, max = 220) {
  const s = String(text ?? "").trim();
  if (!s) return "";
  if (s.length <= max) return s;
  return `${s.slice(0, max).trim()}…`;
}

function pickItemImage(item) {
  return (
    item?.image ||
    item?.thumbnail ||
    item?.thumb ||
    item?.cover ||
    item?.coverImage ||
    item?.heroImage ||
    ""
  );
}

function pickItemDescription(item) {
  return truncateText(
    item?.excerpt ||
      item?.summary ||
      item?.description ||
      stripHtml(item?.content),
  );
}

function joinHaystack(parts) {
  return normalizeSearchText(parts.filter(Boolean).join(" "));
}

function staticEntryHaystack(entry) {
  return joinHaystack([
    entry.label,
    entry.extra,
    entry.to,
    TYPE_LABELS[entry.type],
  ]);
}

function catalogEntryHaystack(item) {
  return joinHaystack([
    item.title,
    item.slug,
    item.excerpt,
    item.description,
    stripHtml(item.content),
    item.category,
  ]);
}

function newsEntryHaystack(item) {
  return joinHaystack([
    item.title,
    item.slug,
    item.excerpt,
    stripHtml(item.content),
  ]);
}

/** @returns {Promise<Array<{ id: string, type: string, typeLabel: string, title: string, subtitle?: string, to: string, sectionId?: string|null, haystack: string }>>} */
export async function fetchSiteSearchIndex() {
  const entries = STATIC_SEARCH_ENTRIES.map((entry) => ({
    id: entry.id,
    type: entry.type,
    typeLabel: TYPE_LABELS[entry.type],
    title: entry.label,
    subtitle: entry.to,
    description: truncateText(entry.extra || entry.label),
    image: "",
    to: entry.to,
    sectionId: entry.sectionId ?? null,
    haystack: staticEntryHaystack(entry),
  }));

  try {
    const [productsRes, newsRes] = await Promise.all([
      fetch("/api/products?page=1&limit=200"),
      fetch("/api/news?page=1&limit=100"),
    ]);

    if (productsRes.ok) {
      const productsJson = await productsRes.json();
      const raw = Array.isArray(productsJson)
        ? productsJson
        : productsJson?.data || [];
      for (const item of raw) {
        if (item?.isActive === false) continue;
        const isSolution = item?.category === "solution";
        const type = isSolution ? "solution" : "product";
        entries.push({
          id: String(item._id || item.id || item.slug || item.title),
          type,
          typeLabel: TYPE_LABELS[type],
          title: String(item.title || "").trim() || "Không có tiêu đề",
          subtitle: isSolution ? "Giải pháp" : "Sản phẩm",
          description: pickItemDescription(item),
          image: pickItemImage(item),
          to: catalogItemPath(item),
          sectionId: null,
          haystack: catalogEntryHaystack(item),
        });
      }
    }

    if (newsRes.ok) {
      const newsJson = await newsRes.json();
      const rawNews = Array.isArray(newsJson) ? newsJson : newsJson?.data || [];
      for (const item of rawNews) {
        if (item?.isPublished === false) continue;
        entries.push({
          id: String(item._id || item.id || item.slug || item.title),
          type: "news",
          typeLabel: TYPE_LABELS.news,
          title: String(item.title || "").trim() || "Không có tiêu đề",
          subtitle: "Tin tức",
          description: pickItemDescription(item),
          image: pickItemImage(item),
          to: newsArticlePath(item),
          sectionId: null,
          haystack: newsEntryHaystack(item),
        });
      }
    }
  } catch {
    /* giữ index trang tĩnh nếu API lỗi */
  }

  return entries;
}

function scoreEntry(entry, q) {
  const title = normalizeSearchText(entry.title);
  let score = 0;
  if (title === q) score += 100;
  else if (title.startsWith(q)) score += 60;
  else if (title.includes(q)) score += 40;
  if (entry.haystack.includes(q)) score += 25;
  const words = q.split(/\s+/).filter((w) => w.length >= 2);
  if (words.length > 1 && words.every((w) => entry.haystack.includes(w))) {
    score += 15;
  }
  return score;
}

export function filterSiteSearch(entries, query, limit = 10) {
  const q = normalizeSearchText(query);
  if (!q || q.length < 1) return [];

  const matched = entries
    .map((entry) => ({ entry, score: scoreEntry(entry, q) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ entry }) => entry);

  return matched;
}

const CATALOG_TYPES = ["product", "solution", "news"];

function shuffleArray(items) {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** 5 mục ngẫu nhiên, ưu tiên có đủ sản phẩm / giải pháp / tin tức khi dữ liệu cho phép */
export function pickRandomSearchSuggestions(entries, limit = 5) {
  const pool = entries.filter((e) => CATALOG_TYPES.includes(e.type));
  if (!pool.length) return [];

  const buckets = {
    product: shuffleArray(pool.filter((e) => e.type === "product")),
    solution: shuffleArray(pool.filter((e) => e.type === "solution")),
    news: shuffleArray(pool.filter((e) => e.type === "news")),
  };

  const picked = [];
  const seen = new Set();

  function take(entry) {
    if (!entry || picked.length >= limit) return;
    const key = `${entry.type}:${entry.id}`;
    if (seen.has(key)) return;
    seen.add(key);
    picked.push(entry);
  }

  for (const type of CATALOG_TYPES) {
    if (buckets[type].length) take(buckets[type].shift());
  }

  const rest = shuffleArray(
    CATALOG_TYPES.flatMap((type) => buckets[type]),
  );
  for (const entry of rest) {
    if (picked.length >= limit) break;
    take(entry);
  }

  return shuffleArray(picked).slice(0, limit);
}
