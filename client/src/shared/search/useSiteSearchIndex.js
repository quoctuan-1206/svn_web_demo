import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { applySearchLocale, fetchSiteSearchIndex } from "./siteSearch";

let cachedIndex = null;
let loadPromise = null;

function loadIndex(t) {
  if (cachedIndex) return Promise.resolve(cachedIndex);
  if (!loadPromise) {
    loadPromise = fetchSiteSearchIndex(t)
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

/** Tải một lần danh mục trang + sản phẩm + giải pháp + tin để tìm kiếm. */
export function useSiteSearchIndex() {
  const { t, i18n } = useTranslation();
  const [rawEntries, setRawEntries] = useState(cachedIndex || []);
  const [loading, setLoading] = useState(!cachedIndex);

  useEffect(() => {
    let cancelled = false;
    loadIndex(t).then((data) => {
      if (!cancelled) {
        setRawEntries(data);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [t]);

  const entries = useMemo(
    () => applySearchLocale(rawEntries, t, i18n.language),
    [rawEntries, t, i18n.language],
  );

  return { entries, loading };
}
