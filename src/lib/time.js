export function toMillis(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (value && typeof value === "object" && typeof value.toMillis === "function") {
    return value.toMillis();
  }
  return 0;
}

export function eventDayKey(date) {
  return typeof date === "string" ? date.trim().slice(0, 10) : "";
}

export function todayKey() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export function readEventStatus(status, date) {
  if (status === "upcoming" || status === "ended") return status;
  const key = eventDayKey(date);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) return "upcoming";
  return key >= todayKey() ? "upcoming" : "ended";
}

export function formatDay(date, locale) {
  const key = eventDayKey(date);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) return "";
  const [year, month, day] = key.split("-").map(Number);
  try {
    return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(year, month - 1, day));
  } catch {
    return key;
  }
}

export function formatMillis(value, locale) {
  const millis = toMillis(value);
  if (!millis) return "";
  try {
    return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(millis));
  } catch {
    return "";
  }
}
