import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { animate, motion } from "framer-motion";
import { normalizeImageUrl } from "@/lib/image";
import { useLenis } from "@/components/layout/LenisProvider";

const EASE = [0.76, 0, 0.24, 1];

function preloadImage(src) {
  return new Promise((resolve) => {
    if (!src) {
      resolve(null);
      return;
    }
    const img = new Image();
    img.onload = () =>
      resolve({
        width: img.naturalWidth || 1,
        height: img.naturalHeight || 1,
      });
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function coverPlacement(boxW, boxH, imgW, imgH, zoom) {
  const scale = Math.max(boxW / imgW, boxH / imgH) * zoom;
  return {
    x: (boxW - imgW * scale) / 2,
    y: (boxH - imgH * scale) / 2,
    scale,
  };
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function buildTiles(imageUrl, sideImages, mobile) {
  const count = mobile ? 3 : 5;
  const center = Math.floor(count / 2);
  const pool = [];
  const push = (src) => {
    const value = String(src || "").trim();
    if (value && !pool.includes(value)) pool.push(value);
  };
  (sideImages || []).forEach(push);
  push(imageUrl);
  const sides = pool.filter((src) => src !== imageUrl);
  const fallback = sides.length ? sides : pool;
  const tiles = [];
  let side = 0;
  for (let index = 0; index < count; index += 1) {
    if (index === center) {
      tiles.push({ id: "center", src: imageUrl || fallback[0] || "", hero: true });
    } else {
      const src = fallback.length ? fallback[side % fallback.length] : "";
      tiles.push({ id: `side-${side}`, src, hero: false });
      side += 1;
    }
  }
  return tiles;
}

export default function InnerPageIntro({ imageUrl, sideImages = [], onDone }) {
  const lenis = useLenis();
  const centerRef = useRef(null);
  const clipRef = useRef(null);
  const photoRef = useRef(null);
  const doneRef = useRef(false);
  const sizeRef = useRef(null);
  const modeRef = useRef("panel");
  const onDoneRef = useRef(onDone);
  const [phase, setPhase] = useState("in");
  const [expanding, setExpanding] = useState(false);
  const [clipPhoto, setClipPhoto] = useState(false);
  const [armed, setArmed] = useState(false);
  const [portalReady, setPortalReady] = useState(false);
  const [mobile] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(max-width: 767px)").matches
      : false,
  );
  const [rtl] = useState(() =>
    typeof document !== "undefined" ? document.documentElement.dir === "rtl" : true,
  );

  onDoneRef.current = onDone;

  const src = useMemo(
    () => (imageUrl ? normalizeImageUrl(imageUrl, { width: 1600, quality: 78 }) : ""),
    [imageUrl],
  );
  const tiles = useMemo(
    () =>
      buildTiles(
        src,
        sideImages.map((item) =>
          item ? normalizeImageUrl(item, { width: 900, quality: 70 }) : "",
        ),
        mobile,
      ),
    [src, sideImages, mobile],
  );
  const centerIndex = Math.floor(tiles.length / 2);
  const drift = rtl ? "6vw" : "-6vw";

  const finish = (mode) => {
    if (doneRef.current) return;
    doneRef.current = true;
    document.documentElement.dataset.pageIntro = "done";
    document.body.style.overflow = "";
    try {
      lenis?.instance?.start?.();
    } catch {
      /* ignore */
    }
    onDoneRef.current?.(mode);
  };

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.pageIntro = "playing";
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.scrollTo(0, 0);
    try {
      lenis?.instance?.stop?.();
    } catch {
      /* ignore */
    }
    return () => {
      document.body.style.overflow = previous;
      if (document.documentElement.dataset.pageIntro === "playing") {
        document.documentElement.dataset.pageIntro = "done";
      }
      try {
        lenis?.instance?.start?.();
      } catch {
        /* ignore */
      }
    };
  }, [lenis]);

  useEffect(() => {
    let alive = true;
    const giveUp = window.setTimeout(() => {
      if (alive) setArmed(true);
    }, 600);
    preloadImage(src).then((size) => {
      if (!alive) return;
      sizeRef.current = size;
      setArmed(true);
      window.clearTimeout(giveUp);
    });
    return () => {
      alive = false;
      window.clearTimeout(giveUp);
    };
  }, [src]);

  useEffect(() => {
    const skip = () => finish("skip");
    const onKey = () => skip();
    window.addEventListener("pointerdown", skip);
    window.addEventListener("wheel", skip, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", skip);
      window.removeEventListener("wheel", skip);
      window.removeEventListener("keydown", onKey);
    };
  }, [lenis]);

  useEffect(() => {
    if (!armed) return undefined;
    const stripMs = mobile ? 440 : 600;
    const focusAt = stripMs;
    const expandAt = mobile ? 650 : 900;
    const expandMs = mobile ? 650 : 900;
    const timers = [];

    timers.push(window.setTimeout(() => setPhase("focus"), focusAt));
    timers.push(
      window.setTimeout(() => {
        const node = centerRef.current?.querySelector("img");
        if (!sizeRef.current && node?.naturalWidth) {
          sizeRef.current = {
            width: node.naturalWidth,
            height: node.naturalHeight,
          };
        }
        const usePhoto = Boolean(sizeRef.current);
        modeRef.current = usePhoto ? "photo" : "panel";
        setClipPhoto(usePhoto);
        setExpanding(true);
      }, expandAt),
    );
    timers.push(
      window.setTimeout(() => {
        const heroImg = document.querySelector("[data-page-hero-photo]");
        if (heroImg && modeRef.current === "photo") heroImg.style.opacity = "1";
        finish(modeRef.current);
      }, expandAt + expandMs),
    );

    return () => {
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [armed, mobile, lenis]);

  useLayoutEffect(() => {
    if (!expanding || doneRef.current) return undefined;
    const clip = clipRef.current;
    const photo = photoRef.current;
    const node = centerRef.current;
    const loaded = node?.querySelector("img");
    if (!sizeRef.current && loaded?.naturalWidth) {
      sizeRef.current = {
        width: loaded.naturalWidth,
        height: loaded.naturalHeight,
      };
    }
    const tile = node?.getBoundingClientRect();
    const hero = document.querySelector("[data-page-hero-media]")?.getBoundingClientRect();
    if (!clip || !tile || !hero) return undefined;

    const paint = (t) => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const box = {
        x: lerp(tile.left, hero.left, t),
        y: lerp(tile.top, hero.top, t),
        w: Math.max(1, lerp(tile.width, hero.width, t)),
        h: Math.max(1, lerp(tile.height, hero.height, t)),
      };
      const radius = lerp(12, 0, t);
      const top = Math.max(0, box.y);
      const right = Math.max(0, vw - (box.x + box.w));
      const bottom = Math.max(0, vh - (box.y + box.h));
      const left = Math.max(0, box.x);
      clip.style.clipPath = `inset(${top}px ${right}px ${bottom}px ${left}px round ${radius}px)`;
      const size = sizeRef.current;
      if (!photo || !size) return;
      const place = coverPlacement(box.w, box.h, size.width, size.height, lerp(1, 1.08, t));
      photo.style.transform = `translate3d(${box.x + place.x}px, ${box.y + place.y}px, 0) scale(${place.scale})`;
    };

    paint(0);
    const run = animate(0, 1, {
      duration: (mobile ? 650 : 900) / 1000,
      ease: EASE,
      onUpdate: paint,
    });
    return () => run.stop();
  }, [expanding, mobile]);

  if (!portalReady) return null;

  return createPortal(
    <div className="fixed inset-0 z-[120] bg-[#0A0820]" aria-hidden="true">
      {armed ? (
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="flex items-center justify-center"
          dir="ltr"
          style={{ gap: 24 }}
          initial={{ x: drift }}
          animate={{ x: 0 }}
          transition={{ duration: mobile ? 0.44 : 0.6, ease: EASE }}
        >
          {tiles.map((tile, index) => {
            const fromCenter = index - centerIndex;
            const isCenter = tile.hero;
            const away = fromCenter < 0 ? "-4vw" : "4vw";
            const exit = fromCenter < 0 ? "-80vw" : "80vw";
            return (
              <motion.div
                key={tile.id}
                ref={isCenter ? centerRef : undefined}
                className="relative shrink-0 overflow-hidden bg-[#181060]"
                style={{
                  width: mobile ? "42vw" : "18vw",
                  aspectRatio: "3 / 4",
                  borderRadius: 12,
                  visibility: isCenter && expanding ? "hidden" : "visible",
                }}
                initial={{ opacity: 0, x: 0, filter: "grayscale(1)" }}
                animate={
                  expanding && !isCenter
                    ? { opacity: 0, x: exit, filter: "grayscale(1)" }
                    : phase === "focus" && !isCenter
                      ? { opacity: 0.35, x: away, filter: "grayscale(1)" }
                      : {
                          opacity: 1,
                          x: 0,
                          filter:
                            isCenter && (phase === "focus" || expanding)
                              ? "grayscale(0)"
                              : "grayscale(1)",
                        }
                }
                transition={{
                  opacity: {
                    duration: 0.35,
                    delay: phase === "in" ? index * 0.04 : 0,
                    ease: "linear",
                  },
                  x: { duration: expanding ? 0.7 : 0.3, ease: EASE },
                  filter: { duration: 0.3, ease: "linear" },
                }}
              >
                {tile.src ? (
                  <img
                    src={tile.src}
                    alt=""
                    className="h-full w-full object-cover"
                    draggable={false}
                  />
                ) : null}
              </motion.div>
            );
          })}
        </motion.div>
      </div>
      ) : null}

      {expanding ? (
        <div ref={clipRef} className="pointer-events-none fixed inset-0 z-[121] overflow-hidden">
          {clipPhoto && src && sizeRef.current ? (
            <img
              ref={photoRef}
              src={src}
              alt=""
              draggable={false}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: sizeRef.current.width,
                height: sizeRef.current.height,
                maxWidth: "none",
                transformOrigin: "0 0",
              }}
            />
          ) : (
            <div className="absolute inset-0 bg-[#181060]" />
          )}
        </div>
      ) : null}
    </div>,
    document.body,
  );
}
