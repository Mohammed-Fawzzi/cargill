export function extractIframeSrc(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (raw.includes("<iframe")) {
    const match = raw.match(/src=["']([^"']+)/i);
    return match?.[1] || "";
  }
  return raw;
}

export function toMapEmbedSrc(value) {
  const raw = extractIframeSrc(value);
  if (!raw) return "";

  if (
    /google\.com\/maps\/embed/i.test(raw) ||
    /output=embed/i.test(raw) ||
    /maps\.google\.com\/maps\?/.test(raw)
  ) {
    return raw;
  }

  if (/^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/.test(raw)) {
    return `https://maps.google.com/maps?q=${encodeURIComponent(raw)}&z=15&output=embed`;
  }

  return `https://maps.google.com/maps?q=${encodeURIComponent(raw)}&z=15&output=embed`;
}

export function toMapLink(value) {
  const raw = extractIframeSrc(value);
  if (!raw) return "";
  if (raw.startsWith("http")) return raw.replace("&output=embed", "");
  return `https://maps.google.com/maps?q=${encodeURIComponent(raw)}`;
}
