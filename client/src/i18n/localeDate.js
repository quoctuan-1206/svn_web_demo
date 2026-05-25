import i18n from "./index";

export function formatLocaleDate(
  value,
  options = { year: "numeric", month: "2-digit", day: "2-digit" },
) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const locale = i18n.language === "en" ? "en-US" : "vi-VN";
  return d.toLocaleDateString(locale, options);
}
