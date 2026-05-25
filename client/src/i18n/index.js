import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import vi from "./locales/vi.json";
import en from "./locales/en.json";

const STORAGE_KEY = "svn-locale";

function readStoredLanguage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "vi") return stored;
  } catch {
    /* ignore */
  }
  return "vi";
}

i18n.use(initReactI18next).init({
  resources: {
    vi: { translation: vi },
    en: { translation: en },
  },
  lng: readStoredLanguage(),
  fallbackLng: "vi",
  supportedLngs: ["vi", "en"],
  interpolation: { escapeValue: false },
});

i18n.on("languageChanged", (lng) => {
  document.documentElement.lang = lng;
  try {
    localStorage.setItem(STORAGE_KEY, lng);
  } catch {
    /* ignore */
  }
});

document.documentElement.lang = i18n.language;

export default i18n;
