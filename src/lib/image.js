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

export function buildImageSrcSet(
  url,
  { widths = [640, 960, 1280, 1600, 1920], quality = 75 } = {},
) {
  const source = typeof url === "string" ? url.trim() : "";
  if (!source) return "";
  try {
    const host = new URL(source).hostname.toLowerCase();
    const resizable =
      host.includes("res.cloudinary.com") ||
      host.includes("images.unsplash.com") ||
      host.includes("unsplash.com");
    if (!resizable) return "";
    return widths
      .map((width) => `${normalizeImageUrl(source, { width, quality })} ${width}w`)
      .join(", ");
  } catch {
    return "";
  }
}

export function warnMissingMedia(slot, value) {
  if (value) return;
  if (!import.meta.env.DEV) return;
  console.warn(`[media] empty dashboard field: ${slot}`);
}

export function getDriveFileId(url) {
  const source = typeof url === "string" ? url.trim() : "";
  if (!source) return "";
  try {
    const parsed = new URL(source);
    const host = parsed.hostname.toLowerCase();
    if (
      !host.includes("drive.google.com") &&
      !host.includes("docs.google.com") &&
      !host.includes("drive.usercontent.google.com") &&
      !host.includes("googleapis.com")
    ) {
      return "";
    }
    const fileMatch = parsed.pathname.match(/\/file\/d\/([^/]+)/);
    if (fileMatch?.[1]) return fileMatch[1];
    const apiMatch = parsed.pathname.match(/\/drive\/v3\/files\/([^/]+)/);
    if (apiMatch?.[1]) return apiMatch[1];
    return parsed.searchParams.get("id") || "";
  } catch {
    return "";
  }
}

export function getDriveDirectUrl(url) {
  const id = getDriveFileId(url);
  if (!id) return "";
  return `https://drive.google.com/uc?export=download&id=${encodeURIComponent(id)}`;
}

export function getDriveApiMediaUrl(url) {
  const id = getDriveFileId(url);
  const key = String(import.meta.env.VITE_GOOGLE_API_KEY || "").trim();
  if (!id || !key) return "";
  return `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(id)}?alt=media&key=${encodeURIComponent(key)}`;
}

export function getDriveUserContentUrl(url) {
  const id = getDriveFileId(url);
  if (!id) return "";
  return `https://drive.usercontent.google.com/download?id=${encodeURIComponent(id)}&export=download&confirm=t`;
}

export function getDriveProxyUrl(url) {
  const id = getDriveFileId(url);
  if (!id) return "";
  return `/api/drive-media?id=${encodeURIComponent(id)}`;
}

export function getDrivePosterUrl(url, width = 1920) {
  const id = getDriveFileId(url);
  if (!id) return "";
  const size = Math.max(320, Math.min(Number(width) || 1920, 2560));
  return `https://lh3.googleusercontent.com/d/${encodeURIComponent(id)}=w${size}`;
}

export function resolvePlayableVideoUrl(url) {
  const source = typeof url === "string" ? url.trim() : "";
  if (!source) return "";
  const id = getDriveFileId(source);
  if (id) return getDriveProxyUrl(source);
  try {
    const parsed = new URL(source);
    const host = parsed.hostname.toLowerCase();
    const path = parsed.pathname.toLowerCase();
    if (/\.(mp4|webm|ogg)(\?|$)/i.test(path) || host.includes("res.cloudinary.com")) {
      return source;
    }
    return source;
  } catch {
    return "";
  }
}

export function shouldPlayHeroVideo() {
  if (typeof window === "undefined") return false;
  try {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
    if (window.matchMedia("(max-width: 767px)").matches) return false;
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection?.saveData) return false;
  } catch {
    return false;
  }
  return true;
}
