export const LOCALES = ["ar", "en"];
export const DEFAULT_LOCALE = "ar";
export const LOCALE_STORAGE_KEY = "cargill-locale";

export function isLocale(value) {
  return value === "ar" || value === "en";
}

export function t(value, locale = DEFAULT_LOCALE) {
  if (typeof value === "string") return value;
  if (!value || typeof value !== "object") return "";
  const primary = String(value[locale] ?? "").trim();
  if (primary) return primary;
  const other = locale === "ar" ? value.en : value.ar;
  return String(other ?? "").trim();
}

export function dirFor(locale) {
  return locale === "ar" ? "rtl" : "ltr";
}
