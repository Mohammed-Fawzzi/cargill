import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { animate, motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useLenis } from "@/components/layout/LenisProvider";
import { useSiteData } from "@/context/SiteDataContext";
import { getCategories, getProducts } from "@/services/cms/products";
import {
  buildIntroTiles,
  collectIntroSideImages,
  getIntroTimings,
  introSchedule,
  normalizeIntroSrc,
  preloadImages,
  rtlEnterDelaySec,
} from "@/lib/introMedia";

function outwardX(index, centerIndex, vw) {
  if (index === centerIndex) return 0;
  return index < centerIndex ? `-${vw}vw` : `${vw}vw`;
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
  const cloneImgRef = useRef(null);
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

  const timings = useMemo(
    () => getIntroTimings({ home: false, mobile }),
    [mobile],
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
  const schedule = useMemo(
    () => introSchedule(tiles.length, timings),
    [tiles.length, timings],
  );

  const finish = (mode) => {
    if (doneRef.current) return;
    doneRef.current = true;
    document.documentElement.dataset.pageIntro = "revealing";
    window.setTimeout(() => {
      document.documentElement.dataset.pageIntro = "done";
    }, timings.overlayMs + timings.navDelayMs + 40);
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
    preloadImages(sources, timings.preloadMaxMs).finally(() => {
      if (!alive) return;
      setPhase("in");
      setArmed(true);
    });
    return () => {
      alive = false;
    };
  }, [tiles, timings.preloadMaxMs]);

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
    const timers = [];
    timers.push(
      window.setTimeout(() => setPhase("hold"), schedule.enterEndMs),
    );
    timers.push(
      window.setTimeout(() => setPhase("focus"), schedule.focusAtMs),
    );
    timers.push(
      window.setTimeout(() => {
        setPhase("expand");
        setExpanding(true);
      }, schedule.expandAtMs),
    );
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [armed, schedule]);

  useLayoutEffect(() => {
    if (!expanding || doneRef.current) return undefined;

    let stopped = false;
    let run = null;
    let tries = 0;

    const startExpand = () => {
      if (stopped || doneRef.current) return;
      const tileNode = centerRef.current;
      const heroImg =
        document.querySelector("[data-page-hero-photo]") ||
        document.querySelector("[data-page-hero-media]");
      const clone = cloneRef.current;
      const cloneImg = cloneImgRef.current;
      if (!tileNode || !heroImg || !clone || !cloneImg) {
        tries += 1;
        if (tries < 8) {
          requestAnimationFrame(startExpand);
          return;
        }
        finish("panel");
        return;
      }

      const first = tileNode.getBoundingClientRect();
      const last = heroImg.getBoundingClientRect();
      const lastW = Math.max(last.width, 1);
      const lastH = Math.max(last.height, 1);
      const sx = first.width / lastW;
      const sy = first.height / lastH;
      const dx =
        first.left + first.width / 2 - (last.left + last.width / 2);
      const dy =
        first.top + first.height / 2 - (last.top + last.height / 2);
      const endScale = timings.endHeroScale;
      const objectPosition =
        getComputedStyle(heroImg).objectPosition || "center center";
      const radius = timings.radiusPx;
      const imgStart = Math.max(
        1 / Math.max(sx, 0.001),
        1 / Math.max(sy, 0.001),
      );

      clone.style.position = "fixed";
      clone.style.left = `${last.left}px`;
      clone.style.top = `${last.top}px`;
      clone.style.width = `${last.width}px`;
      clone.style.height = `${last.height}px`;
      clone.style.margin = "0";
      clone.style.overflow = "hidden";
      clone.style.transformOrigin = "center center";
      clone.style.zIndex = "122";
      clone.style.willChange = "transform, clip-path, opacity";
      clone.style.clipPath = `inset(0 round ${radius}px)`;
      clone.style.transform = `translate3d(${dx}px, ${dy}px, 0) scale(${sx}, ${sy})`;
      clone.style.opacity = "1";

      cloneImg.style.width = "100%";
      cloneImg.style.height = "100%";
      cloneImg.style.objectFit = "cover";
      cloneImg.style.objectPosition = objectPosition;
      cloneImg.style.transformOrigin = "center center";
      cloneImg.style.willChange = "transform";
      cloneImg.style.transform = `scale(${imgStart})`;

      const heroPhoto = document.querySelector("[data-page-hero-photo]");
      if (heroPhoto) {
        heroPhoto.style.opacity = "0";
        heroPhoto.style.transformOrigin = "center center";
      }

      run = animate(0, 1, {
        duration: timings.expandMs / 1000,
        ease: timings.expandEase,
        onUpdate: (t) => {
          const tx = dx * (1 - t);
          const ty = dy * (1 - t);
          const scaleX = sx + (endScale - sx) * t;
          const scaleY = sy + (endScale - sy) * t;
          const r = radius * (1 - t);
          const imgScale = imgStart * (1 - t) + t;
          clone.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(${scaleX}, ${scaleY})`;
          clone.style.clipPath = `inset(0 round ${r}px)`;
          cloneImg.style.transform = `scale(${imgScale})`;
        },
        onComplete: () => {
          requestAnimationFrame(() => {
            if (heroPhoto) {
              heroPhoto.style.opacity = "1";
              heroPhoto.style.transform = `translate3d(0, 0, 0) scale(${endScale})`;
            }
            clone.style.opacity = "0";
            finish("photo");
            requestAnimationFrame(() => {
              if (clone.parentNode) clone.style.display = "none";
            });
          });
        },
      });
    };

    startExpand();

    return () => {
      stopped = true;
      run?.stop?.();
    };
  }, [expanding, timings]);

  if (!portalReady) return null;

  const focused = phase === "focus" || expanding;

  return createPortal(
    <div className="fixed inset-0 z-[120] bg-[#0A0820]" aria-hidden="true">
      {armed && phase !== "boot" ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="flex items-center justify-center"
            dir="ltr"
            style={{ gap: mobile ? 16 : 24 }}
          >
            {tiles.map((tile, index) => {
              const isCenter = tile.hero;
              const enterDelay = rtlEnterDelaySec(
                index,
                tiles.length,
                timings.staggerMs,
              );
              return (
                <motion.div
                  key={tile.id}
                  ref={isCenter ? centerRef : undefined}
                  className="relative shrink-0 overflow-hidden bg-[#181060]"
                  style={{
                    width: mobile ? "42vw" : "18vw",
                    aspectRatio: "3 / 4",
                    borderRadius: timings.radiusPx,
                    willChange: "transform, opacity, filter",
                    visibility: isCenter && expanding ? "hidden" : "visible",
                  }}
                  initial={{
                    opacity: 0,
                    y: timings.enterY,
                    scale: timings.enterScale,
                    filter: "grayscale(1)",
                    x: 0,
                  }}
                  animate={
                    expanding && !isCenter
                      ? {
                          opacity: 0,
                          x: outwardX(
                            index,
                            centerIndex,
                            timings.expandDriftVw,
                          ),
                          y: 0,
                          scale: 1,
                          filter: "grayscale(1)",
                        }
                      : focused && !isCenter
                        ? {
                            opacity: timings.focusSideOpacity,
                            x: outwardX(
                              index,
                              centerIndex,
                              timings.focusDriftVw,
                            ),
                            y: 0,
                            scale: 1,
                            filter: "grayscale(1)",
                          }
                        : focused && isCenter
                          ? {
                              opacity: 1,
                              x: 0,
                              y: 0,
                              scale: timings.focusScale,
                              filter: "grayscale(0)",
                            }
                          : {
                              opacity: 1,
                              x: 0,
                              y: 0,
                              scale: 1,
                              filter: "grayscale(1)",
                            }
                  }
                  transition={
                    phase === "in"
                      ? {
                          duration: timings.tileMs / 1000,
                          delay: enterDelay,
                          ease: timings.ease,
                        }
                      : expanding
                        ? {
                            duration: timings.expandMs / 1000,
                            ease: timings.expandEase,
                          }
                        : {
                            duration: timings.focusMs / 1000,
                            ease: timings.ease,
                          }
                  }
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
        <div
          ref={cloneRef}
          className="pointer-events-none fixed z-[122]"
          aria-hidden="true"
        >
          <img
            ref={cloneImgRef}
            src={centerSrc}
            alt=""
            referrerPolicy="no-referrer"
            draggable={false}
          />
        </div>
      ) : null}
    </div>,
    document.body,
  );
}
