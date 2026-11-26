import {
  getDrivePosterUrl,
  normalizeImageUrl,
  resolvePlayableVideoUrl,
} from "@/lib/image";

export const INTRO_EASE = [0.22, 1, 0.36, 1];
export const INTRO_STAGGER_MS = 60;
export const INTRO_TILE_MS = 500;
export const INTRO_FOCUS_MS = 400;
export const INTRO_EXPAND_MS = 900;
export const INTRO_PRELOAD_MAX_MS = 600;
export const INTRO_OVERLAY_MS = 400;
export const INTRO_NAV_DELAY_MS = 100;
export const INTRO_COPY_DELAY_MS = 200;

export function uniqueImages(values = [], exclude = "") {
  const ban = String(exclude || "").trim();
  const seen = new Set(ban ? [ban] : []);
  const out = [];
  values.forEach((value) => {
    const src = String(value || "").trim();
    if (!src || seen.has(src)) return;
    seen.add(src);
    out.push(src);
  });
  return out;
}

export function collectIntroSideImages({
  center = "",
  contact,
  categories = [],
  products = [],
  extras = [],
} = {}) {
  const pool = [];
  const push = (src) => {
    const value = String(src || "").trim();
    if (value) pool.push(value);
  };

  (extras || []).forEach(push);
  push(contact?.bannerUrl);
  push(contact?.aboutImageUrl);
  push(contact?.imageUrl);
  push(contact?.logoUrl);
  (categories || []).forEach((category) => {
    push(category?.imageUrl);
    const cover = (products || []).find(
      (product) => product.sectionId === category?.id && product.imageUrl,
    );
    push(cover?.imageUrl);
  });
  (products || []).forEach((product) => push(product?.imageUrl));

  return uniqueImages(pool, center);
}

export function buildIntroTiles({
  centerSrc = "",
  sideImages = [],
  mobile = false,
}) {
  const count = mobile ? 3 : 5;
  const center = Math.floor(count / 2);
  const sides = uniqueImages(sideImages, centerSrc);
  const tiles = [];
  let side = 0;

  for (let index = 0; index < count; index += 1) {
    if (index === center) {
      tiles.push({
        id: "center",
        src: centerSrc || sides[0] || "",
        hero: true,
      });
      continue;
    }
    tiles.push({
      id: `side-${side}`,
      src: sides[side] || "",
      hero: false,
    });
    side += 1;
  }

  return tiles;
}

export function preloadImages(sources = [], maxWaitMs = INTRO_PRELOAD_MAX_MS) {
  const list = uniqueImages(sources);
  if (!list.length) return Promise.resolve([]);

  const loadOne = (src) =>
    new Promise((resolve) => {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => resolve(src);
      img.onerror = () => resolve("");
      img.referrerPolicy = /googleusercontent\.com/i.test(src)
        ? "no-referrer"
        : undefined;
      img.src = src;
    });

  return Promise.race([
    Promise.all(list.map(loadOne)).then((items) => items.filter(Boolean)),
    new Promise((resolve) => {
      window.setTimeout(() => resolve(list), maxWaitMs);
    }),
  ]);
}

export function captureVideoFrame(url, timeoutMs = 2500) {
  const source = resolvePlayableVideoUrl(url);
  if (!source || typeof document === "undefined") {
    return Promise.resolve("");
  }

  return new Promise((resolve) => {
    const video = document.createElement("video");
    let done = false;
    const finish = (value) => {
      if (done) return;
      done = true;
      window.clearTimeout(timer);
      try {
        video.pause();
        video.removeAttribute("src");
        video.load();
      } catch {}
      resolve(value || "");
    };

    const timer = window.setTimeout(() => finish(""), timeoutMs);
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.setAttribute("playsinline", "");
    video.crossOrigin = "anonymous";

    const draw = () => {
      try {
        const width = video.videoWidth || 0;
        const height = video.videoHeight || 0;
        if (!width || !height) {
          finish(getDrivePosterUrl(url) || "");
          return;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          finish(getDrivePosterUrl(url) || "");
          return;
        }
        ctx.drawImage(video, 0, 0, width, height);
        finish(canvas.toDataURL("image/jpeg", 0.84));
      } catch {
        finish(getDrivePosterUrl(url) || "");
      }
    };

    video.addEventListener(
      "loadeddata",
      () => {
        try {
          if (video.currentTime > 0.01) {
            draw();
            return;
          }
          const onSeeked = () => {
            video.removeEventListener("seeked", onSeeked);
            draw();
          };
          video.addEventListener("seeked", onSeeked);
          video.currentTime = 0.001;
        } catch {
          draw();
        }
      },
      { once: true },
    );
    video.addEventListener("error", () => finish(getDrivePosterUrl(url) || ""), {
      once: true,
    });
    video.src = source;
  });
}

export function normalizeIntroSrc(src, width = 1200) {
  const value = String(src || "").trim();
  if (!value) return "";
  if (value.startsWith("data:")) return value;
  return normalizeImageUrl(value, { width, quality: 78 });
}

export function measureClientSize() {
  if (typeof document === "undefined") {
    return { width: 0, height: 0 };
  }
  return {
    width: document.documentElement.clientWidth || window.innerWidth || 0,
    height: document.documentElement.clientHeight || window.innerHeight || 0,
  };
}
