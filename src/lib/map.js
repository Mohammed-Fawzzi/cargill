export function extractIframeSrc(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (raw.includes("<iframe")) {
    const match = raw.match(/src=["']([^"']+)/i);
    return match?.[1] || "";
  }
  return raw;
}

function roadPin(raw) {
  const text = String(raw || "");
  if (text.startsWith("http")) return null;
  if (
    text.includes("الكيلو 13") &&
    text.includes("الزراعي") &&
    text.includes("الإسكندرية")
  ) {
    return { lat: 31.203075, lng: 30.009764, label: text };
  }
  return null;
}

export function toMapEmbedSrc(value) {
  const raw = extractIframeSrc(value);
  if (!raw) return "";

  const pin = roadPin(raw);
  if (pin) {
    const q = encodeURIComponent(`${pin.lat},${pin.lng} (${pin.label})`);
    return `https://maps.google.com/maps?q=${q}&z=16&hl=ar&output=embed`;
  }

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
  const pin = roadPin(raw);
  if (pin) {
    return `https://www.google.com/maps?q=${pin.lat},${pin.lng}&hl=ar&z=16`;
  }
  if (raw.startsWith("http")) return raw.replace("&output=embed", "");
  return `https://maps.google.com/maps?q=${encodeURIComponent(raw)}`;
}
