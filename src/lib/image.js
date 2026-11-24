export function normalizeImageUrl(url) {
  const source = typeof url === "string" ? url.trim() : "";
  if (!source) return "";

  try {
    const parsed = new URL(source);
    const host = parsed.hostname.toLowerCase();

    if (host.includes("images.unsplash.com") || host.includes("unsplash.com")) {
      parsed.search = "";
      return parsed.toString();
    }

    return source;
  } catch {
    return source;
  }
}

export const FALLBACK_IMAGE = "/images/company-cta.jpg";
