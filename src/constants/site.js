export const SITE_FALLBACK_NAME = "كارجيل";

export const SITE_URL = import.meta.env.VITE_SITE_URL || "";

export const getCanonicalUrl = (path = "/") => {
  if (!SITE_URL) return path;
  const normalizedPath = path === "/" ? "" : path;
  return `${SITE_URL.replace(/\/$/, "")}${normalizedPath}`;
};
