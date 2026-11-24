export function normalizeImageUrl(url, { width = 1600, quality = 75 } = {}) {
  const source = typeof url === "string" ? url.trim() : "";
  if (!source) return "";

  try {
    const parsed = new URL(source);
    const host = parsed.hostname.toLowerCase();

    if (host.includes("images.unsplash.com") || host.includes("unsplash.com")) {
      parsed.search = "";
      parsed.searchParams.set("auto", "format");
      parsed.searchParams.set("fit", "max");
      parsed.searchParams.set("w", String(width));
      parsed.searchParams.set("q", String(quality));
      return parsed.toString();
    }

    return source;
  } catch {
    return source;
  }
}

export const FALLBACK_IMAGE = "/images/company-cta.jpg";
