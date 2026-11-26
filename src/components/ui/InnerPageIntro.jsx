import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { animate, motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useLenis } from "@/components/layout/LenisProvider";
import { useSiteData } from "@/context/SiteDataContext";
import { getCategories, getProducts } from "@/services/cms/products";
import {
  INTRO_EASE,
  INTRO_EXPAND_MS,
  INTRO_FOCUS_MS,
  INTRO_PRELOAD_MAX_MS,
  INTRO_STAGGER_MS,
  INTRO_TILE_MS,
  buildIntroTiles,
  collectIntroSideImages,
  normalizeIntroSrc,
  preloadImages,
} from "@/lib/introMedia";

function staggerDelay(index, centerIndex) {
  const distance = Math.abs(index - centerIndex);
  return (distance * INTRO_STAGGER_MS) / 1000;
}

function outwardX(index, centerIndex) {
  if (index === centerIndex) return 0;
  return index < centerIndex ? "-5vw" : "5vw";
}

export default function InnerPageIntro({ imageUrl, sideImages = [], onDone }) {
  const lenis = useLenis();
  const { contact } = useSiteData();
  const categoriesQuery = useQuery({
    queryKey: ["cms", "categories"],
    queryFn: getCategories,
    staleTime: 1000 * 60 * 5,
  });
  const productsQuery = useQuery({
    queryKey: ["cms", "products"],
    queryFn: getProducts,
    staleTime: 1000 * 60 * 5,
  });
  const centerRef = useRef(null);
  const cloneRef = useRef(null);
  const doneRef = useRef(false);
  const onDoneRef = useRef(onDone);
  const [phase, setPhase] = useState("boot");
  const [expanding, setExpanding] = useState(false);
  const [portalReady, setPortalReady] = useState(false);
  const [armed, setArmed] = useState(false);
  const [mobile] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(max-width: 767px)").matches
      : false,
  );

  onDoneRef.current = onDone;

  const centerSrc = useMemo(
    () => normalizeIntroSrc(imageUrl, 1600),
    [imageUrl],
  );

  const tiles = useMemo(() => {
    const pool = collectIntroSideImages({
      center: imageUrl,
      contact,
      categories: categoriesQuery.data || [],
      products: productsQuery.data || [],
      extras: sideImages,
    });
    return buildIntroTiles({
      centerSrc,
      sideImages: pool.map((src) => normalizeIntroSrc(src, 900)),
      mobile,
    });
  }, [
    centerSrc,
    imageUrl,
    sideImages,
    contact,
    categoriesQuery.data,
    productsQuery.data,
    mobile,
  ]);

  const centerIndex = Math.floor(tiles.length / 2);

  const finish = (mode) => {
    if (doneRef.current) return;
    doneRef.current = true;
    document.documentElement.dataset.pageIntro = "revealing";
    window.setTimeout(() => {
      document.documentElement.dataset.pageIntro = "done";
    }, 520);
    document.body.style.overflow = "";
    try {
      lenis?.instance?.start?.();
    } catch {}
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
    } catch {}
    return () => {
      document.body.style.overflow = previous;
      if (document.documentElement.dataset.pageIntro === "playing") {
        document.documentElement.dataset.pageIntro = "done";
      }
      try {
        lenis?.instance?.start?.();
      } catch {}
    };
  }, [lenis]);

  useEffect(() => {
    let alive = true;
    const sources = tiles.map((tile) => tile.src).filter(Boolean);
    preloadImages(sources, INTRO_PRELOAD_MAX_MS).finally(() => {
      if (alive) setArmed(true);
    });
    return () => {
      alive = false;
    };
  }, [tiles]);

  useEffect(() => {
    const skip = () => finish("skip");
    window.addEventListener("pointerdown", skip);
    window.addEventListener("wheel", skip, { passive: true });
    window.addEventListener("keydown", skip);
    return () => {
      window.removeEventListener("pointerdown", skip);
      window.removeEventListener("wheel", skip);
      window.removeEventListener("keydown", skip);
    };
  }, []);

  useEffect(() => {
    if (!armed) return undefined;
    setPhase("in");
    const focusAt = INTRO_TILE_MS + centerIndex * INTRO_STAGGER_MS + 80;
    const expandAt = focusAt + INTRO_FOCUS_MS + 120;
    const timers = [];
    timers.push(window.setTimeout(() => setPhase("focus"), focusAt));
    timers.push(window.setTimeout(() => setExpanding(true), expandAt));
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [armed, centerIndex]);

  useLayoutEffect(() => {
    if (!expanding || doneRef.current) return undefined;

    const tileNode = centerRef.current;
    const heroImg =
      document.querySelector("[data-page-hero-photo]") ||
      document.querySelector("[data-page-hero-media]");
    const clone = cloneRef.current;
    if (!tileNode || !heroImg || !clone) {
      finish("panel");
      return undefined;
    }

    const first = tileNode.getBoundingClientRect();
    const last = heroImg.getBoundingClientRect();

    const dx = first.left - last.left;
    const dy = first.top - last.top;
    const sx = first.width / Math.max(last.width, 1);
    const sy = first.height / Math.max(last.height, 1);

    clone.style.position = "fixed";
    clone.style.left = `${last.left}px`;
    clone.style.top = `${last.top}px`;
    clone.style.width = `${last.width}px`;
    clone.style.height = `${last.height}px`;
    clone.style.margin = "0";
    clone.style.objectFit = "cover";
    clone.style.objectPosition = "center";
    clone.style.transformOrigin = "top left";
    clone.style.borderRadius = "12px";
    clone.style.zIndex = "122";
    clone.style.willChange = "transform, border-radius";
    clone.style.transform = `translate3d(${dx}px, ${dy}px, 0) scale(${sx}, ${sy})`;
    clone.style.opacity = "1";

    const heroPhoto = document.querySelector("[data-page-hero-photo]");
    if (heroPhoto) heroPhoto.style.opacity = "0";

    const run = animate(0, 1, {
      duration: INTRO_EXPAND_MS / 1000,
      ease: INTRO_EASE,
      onUpdate: (t) => {
        const tx = dx * (1 - t);
        const ty = dy * (1 - t);
        const scaleX = sx + (1.08 - sx) * t;
        const scaleY = sy + (1.08 - sy) * t;
        const radius = 12 * (1 - t);
        clone.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(${scaleX}, ${scaleY})`;
        clone.style.borderRadius = `${radius}px`;
      },
      onComplete: () => {
        requestAnimationFrame(() => {
          if (heroPhoto) {
            heroPhoto.style.opacity = "1";
            heroPhoto.style.transform = "translate3d(0, 0, 0) scale(1.08)";
          }
          clone.style.opacity = "0";
          finish("photo");
          requestAnimationFrame(() => {
            if (clone.parentNode) clone.style.display = "none";
          });
        });
      },
    });

    return () => run.stop();
  }, [expanding]);

  if (!portalReady) return null;

  return createPortal(
    <div className="fixed inset-0 z-[120] bg-[#0A0820]" aria-hidden="true">
      {armed ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="flex items-center justify-center"
            dir="ltr"
            style={{ gap: mobile ? 16 : 24 }}
          >
            {tiles.map((tile, index) => {
              const isCenter = tile.hero;
              const focused = phase === "focus" || expanding;
              return (
                <motion.div
                  key={tile.id}
                  ref={isCenter ? centerRef : undefined}
                  className="relative shrink-0 overflow-hidden bg-[#181060]"
                  style={{
                    width: mobile ? "42vw" : "18vw",
                    aspectRatio: "3 / 4",
                    borderRadius: 12,
                    willChange: "transform, opacity",
                    visibility: isCenter && expanding ? "hidden" : "visible",
                  }}
                  initial={{ opacity: 0, y: 24, filter: "grayscale(1)" }}
                  animate={
                    expanding && !isCenter
                      ? {
                          opacity: 0,
                          x: outwardX(index, centerIndex),
                          y: 0,
                          filter: "grayscale(1)",
                        }
                      : focused && !isCenter
                        ? {
                            opacity: 0.35,
                            x: outwardX(index, centerIndex),
                            y: 0,
                            filter: "grayscale(1)",
                          }
                        : {
                            opacity: 1,
                            x: 0,
                            y: 0,
                            filter:
                              isCenter && focused
                                ? "grayscale(0)"
                                : "grayscale(1)",
                          }
                  }
                  transition={{
                    duration:
                      phase === "in"
                        ? INTRO_TILE_MS / 1000
                        : INTRO_FOCUS_MS / 1000,
                    delay: phase === "in" ? staggerDelay(index, centerIndex) : 0,
                    ease: INTRO_EASE,
                  }}
                >
                  {tile.src ? (
                    <img
                      src={tile.src}
                      alt=""
                      className="h-full w-full object-cover object-center"
                      referrerPolicy="no-referrer"
                      draggable={false}
                    />
                  ) : null}
                </motion.div>
              );
            })}
          </div>
        </div>
      ) : null}

      {expanding && centerSrc ? (
        <img
          ref={cloneRef}
          src={centerSrc}
          alt=""
          referrerPolicy="no-referrer"
          draggable={false}
          className="pointer-events-none fixed z-[122] object-cover object-center"
        />
      ) : null}
    </div>,
    document.body,
  );
}
