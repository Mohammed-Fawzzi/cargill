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

    if (host.includes("res.cloudinary.com")) {
      const parts = parsed.pathname.split("/");
      const uploadIndex = parts.indexOf("upload");
      if (uploadIndex >= 0) {
        const next = parts[uploadIndex + 1] || "";
        const hasTransform = /^(c_|w_|h_|q_|f_|fl_)/.test(next);
        if (!hasTransform) {
          parts.splice(
            uploadIndex + 1,
            0,
            `f_auto,q_${quality},w_${width},c_limit`,
          );
          parsed.pathname = parts.join("/");
        }
      }
      return parsed.toString();
    }

    return source;
  } catch {
    return source;
  }
}
