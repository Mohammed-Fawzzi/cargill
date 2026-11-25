function pad(value) {
  return String(value).padStart(2, "0");
}

function toUtcStamp(date) {
  return (
    date.getUTCFullYear() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    "T" +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    pad(date.getUTCSeconds()) +
    "Z"
  );
}

function escapeText(value) {
  return String(value || "")
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function parseTimeParts(time) {
  const raw = String(time || "").trim();
  const match = raw.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return { hours, minutes };
}

export function buildEventIcs({
  title,
  date,
  time,
  location = "",
  description = "",
  url = "",
}) {
  const day = String(date || "").trim().slice(0, 10);
  const parts = parseTimeParts(time);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || !parts) return "";

  const [year, month, dayNum] = day.split("-").map(Number);
  const start = new Date(year, month - 1, dayNum, parts.hours, parts.minutes, 0);
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
  const stamp = toUtcStamp(new Date());
  const uid = `${day}-${parts.hours}${parts.minutes}-${Date.now()}@cargill`;

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Cargill//Events//AR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${toUtcStamp(start)}`,
    `DTEND:${toUtcStamp(end)}`,
    `SUMMARY:${escapeText(title)}`,
    location ? `LOCATION:${escapeText(location)}` : "",
    description ? `DESCRIPTION:${escapeText(description)}` : "",
    url ? `URL:${escapeText(url)}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");
}

export function downloadEventIcs(payload, filename = "event.ics") {
  const body = buildEventIcs(payload);
  if (!body || typeof window === "undefined") return false;
  const blob = new Blob([body], { type: "text/calendar;charset=utf-8" });
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(href);
  return true;
}

export function hasEventTime(time) {
  return Boolean(parseTimeParts(time));
}
