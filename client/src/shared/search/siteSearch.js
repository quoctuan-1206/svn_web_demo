import { catalogItemPath, newsArticlePath } from "../../utils/contentPaths";
import {
  localizedField,
  pickLocalizedLead,
  searchHaystack,
} from "../../i18n/localizeContent";

/** Trang & mục cố định trong dự án */
export const STATIC_SEARCH_ENTRIES = [
  {
    id: "home",
    type: "page",
    labelKey: "search.pages.home",
    to: "/",
    sectionId: null,
  },
  {
    id: "overview",
    type: "page",
    labelKey: "search.pages.overview",
    to: "/tong-quan",
    sectionId: null,
    extra: "tong quan svn automation overview",
  },
  {
    id: "about",
    type: "page",
    labelKey: "search.pages.about",
    to: "/ve-chung-toi",
    sectionId: null,
    extra: "gioi thieu about",
  },
  {
    id: "products",
    type: "page",
    labelKey: "search.pages.products",
    to: "/san-pham",
    sectionId: "san-pham",
    extra: "san pham catalog products",
  },
  {
    id: "solutions",
    type: "page",
    labelKey: "search.pages.solutions",
    to: "/giai-phap",
    sectionId: "giai-phap",
    extra: "giai phap automation solutions",
  },
  {
    id: "partners",
    type: "page",
    labelKey: "search.pages.partners",
    to: "/doi-tac",
    sectionId: "doi-tac",
    extra: "doi tac partner partners",
  },
  {
    id: "news",
    type: "page",
    labelKey: "search.pages.news",
    to: "/tin-tuc",
    sectionId: "tin-tuc",
    extra: "tin tuc news",
  },
  {
    id: "download",
    type: "page",
    labelKey: "search.pages.download",
    to: "/tai-ve",
    sectionId: null,
    extra: "tai ve download tai lieu pdf",
  },
  {
    id: "global",
    type: "page",
    labelKey: "search.pages.global",
    to: "/hien-dien-toan-cau",
    sectionId: null,
    extra: "global presence",
  },
  {
    id: "services",
    type: "page",
    labelKey: "search.pages.services",
    to: "/dich-vu-ho-tro",
    sectionId: null,
    extra: "dich vu ho tro support services",
  },
  {
    id: "contact",
    type: "page",
    labelKey: "search.pages.contact",
    to: "/lien-he",
    sectionId: "lien-he",
    extra: "lien he contact form",
  },
];

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

function pickItemDescription(item, locale = "vi") {
  return truncateText(pickLocalizedLead(item, locale));
}

function joinHaystack(parts) {
  return normalizeSearchText(parts.filter(Boolean).join(" "));
}

function staticEntryHaystack(entry, t) {
  const label = entry.labelKey ? t(entry.labelKey) : entry.label || "";
  return joinHaystack([
    label,
    entry.extra,
    entry.to,
    t(`search.type.${entry.type}`),
  ]);
}

function catalogEntryHaystack(item) {
  return joinHaystack([
    searchHaystack(item, [
      "title",
      "slug",
      "excerpt",
      "description",
      "summary",
      "content",
    ]),
    item.category,
  ]);
}

function newsEntryHaystack(item) {
  return joinHaystack([
    searchHaystack(item, ["title", "slug", "excerpt", "content"]),
  ]);
}

/** Áp nhãn theo locale hiện tại (UI), giữ haystack đã build lúc fetch. */
export function applySearchLocale(entries, t, locale = "vi") {
  return entries.map((entry) => {
    if (entry.labelKey) {
      return {
        ...entry,
        title: t(entry.labelKey),
        typeLabel: t(`search.type.${entry.type}`),
        description: truncateText(entry.extra || t(entry.labelKey)),
      };
    }
    if (entry.sourceItem) {
      const item = entry.sourceItem;
      const title =
        localizedField(item, "title", locale) || t("common.untitled");
      const typeLabel = t(`search.type.${entry.type}`);
      return {
        ...entry,
        title,
        typeLabel,
        subtitle: typeLabel,
        description: pickItemDescription(item, locale),
      };
    }
    return entry;
  });
}

/** @returns {Promise<Array<object>>} */
export async function fetchSiteSearchIndex(t) {
  const translate = typeof t === "function" ? t : (key) => key;
  const entries = STATIC_SEARCH_ENTRIES.map((entry) => ({
    id: entry.id,
    type: entry.type,
    labelKey: entry.labelKey,
    typeLabel: translate(`search.type.${entry.type}`),
    title: translate(entry.labelKey),
    subtitle: entry.to,
    description: truncateText(entry.extra || translate(entry.labelKey)),
    image: "",
    to: entry.to,
    sectionId: entry.sectionId ?? null,
    haystack: staticEntryHaystack(entry, translate),
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
          typeLabel: translate(`search.type.${type}`),
          title: String(item.title || "").trim() || translate("common.untitled"),
          subtitle: translate(`search.type.${type}`),
          description: pickItemDescription(item, "vi"),
          image: pickItemImage(item),
          to: catalogItemPath(item),
          sectionId: null,
          haystack: catalogEntryHaystack(item),
          sourceItem: item,
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
          typeLabel: translate("search.type.news"),
          title: String(item.title || "").trim() || translate("common.untitled"),
          subtitle: translate("search.type.news"),
          description: pickItemDescription(item, "vi"),
          image: pickItemImage(item),
          to: newsArticlePath(item),
          sectionId: null,
          haystack: newsEntryHaystack(item),
          sourceItem: item,
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
