import { useEffect, useState } from "react";
import { fetchSiteSearchIndex } from "./siteSearch";

let cachedIndex = null;
let loadPromise = null;

function loadIndex() {
  if (cachedIndex) return Promise.resolve(cachedIndex);
  if (!loadPromise) {
    loadPromise = fetchSiteSearchIndex()
      .then((data) => {
        cachedIndex = data;
        return data;
      })
      .catch(() => {
        cachedIndex = [];
        return [];
      });
  }
  return loadPromise;
}

/** Tải một lần danh mục trang + sản phẩm + giải pháp + tin để tìm kiếm header. */
export function useSiteSearchIndex() {
  const [entries, setEntries] = useState(cachedIndex || []);
  const [loading, setLoading] = useState(!cachedIndex);

  useEffect(() => {
    let cancelled = false;
    loadIndex().then((data) => {
      if (!cancelled) {
        setEntries(data);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { entries, loading };
}
