import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { animate, motion } from "framer-motion";
import LogoTriangle from "@/components/ui/LogoTriangle";
import { useLenis } from "@/components/layout/LenisProvider";
import {
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

function measureHeroTarget() {
  const img =
    document.querySelector("[data-home-hero-media] img") ||
    document.querySelector("[data-home-hero-media] video");
  const node = img || document.querySelector("[data-home-hero-media]");
  if (!node) {
    return {
      top: 0,
      left: 0,
      width: document.documentElement.clientWidth || window.innerWidth,
      height: window.innerHeight,
    };
  }
  const rect = node.getBoundingClientRect();
  return {
    top: rect.top,
    left: rect.left,
    width: Math.max(rect.width, 1),
    height: Math.max(rect.height, 1),
  };
}

export default function HomepageIntro({ tiles, onComplete }) {
  const lenis = useLenis();
  const finishedRef = useRef(false);
  const centerRef = useRef(null);
  const cloneRef = useRef(null);
  const cloneImgRef = useRef(null);
  const onCompleteRef = useRef(onComplete);
  const [phase, setPhase] = useState("boot");
  const [expanding, setExpanding] = useState(false);
  const [portalReady, setPortalReady] = useState(false);
  const [armed, setArmed] = useState(false);
  const [frozenTiles, setFrozenTiles] = useState(null);
  const timings = useMemo(() => getIntroTimings({ home: true }), []);

  onCompleteRef.current = onComplete;

  const liveTiles = frozenTiles || tiles || [];

  const tileSources = useMemo(
    () =>
      liveTiles.map((tile) => ({
        ...tile,
        src: normalizeIntroSrc(tile.src, tile.isHero ? 1600 : 720),
      })),
    [liveTiles],
  );

  const isMobileStrip = tileSources.length <= 3;
  const centerIndex = useMemo(() => {
    const index = tileSources.findIndex((tile) => tile.isHero);
    return index >= 0 ? index : Math.floor(tileSources.length / 2);
  }, [tileSources]);

  const schedule = useMemo(
    () => introSchedule(tileSources.length || 1, timings),
    [tileSources.length, timings],
  );

  const finish = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    document.documentElement.dataset.homeIntro = "revealing";
    window.setTimeout(() => {
      document.documentElement.dataset.homeIntro = "done";
    }, timings.overlayMs + timings.navDelayMs + 40);
    document.body.style.overflow = "";
    try {
      lenis?.instance?.start?.();
    } catch {}
    onCompleteRef.current?.();
  };

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.homeIntro = "playing";
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.scrollTo(0, 0);
    try {
      lenis?.instance?.stop?.();
    } catch {}
    return () => {
      document.body.style.overflow = previousOverflow;
      if (document.documentElement.dataset.homeIntro === "playing") {
        document.documentElement.dataset.homeIntro = "done";
      }
      try {
        lenis?.instance?.start?.();
      } catch {}
    };
  }, [lenis]);

  useEffect(() => {
    if (frozenTiles || !(tiles || []).some((tile) => tile.isHero && tile.src)) {
      return undefined;
    }
    let alive = true;
    const next = tiles || [];
    const sources = next
      .map((tile) => normalizeIntroSrc(tile.src, tile.isHero ? 1600 : 720))
      .filter(Boolean);
    preloadImages(sources, timings.preloadMaxMs).finally(() => {
      if (!alive) return;
      setFrozenTiles(next);
      setPhase("in");
      setArmed(true);
    });
    return () => {
      alive = false;
    };
  }, [tiles, frozenTiles, timings.preloadMaxMs]);

  useEffect(() => {
    const skip = () => finish();
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
    if (!tileSources.some((tile) => tile.isHero && tile.src)) {
      finish();
      return undefined;
    }
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
  }, [armed, schedule, tileSources]);

  useLayoutEffect(() => {
    if (!expanding || finishedRef.current) return undefined;

    let stopped = false;
    let run = null;
    let tries = 0;

    const startExpand = () => {
      if (stopped || finishedRef.current) return;
      const tileNode = centerRef.current;
      const clone = cloneRef.current;
      const cloneImg = cloneImgRef.current;
      if (!tileNode || !clone || !cloneImg) {
        tries += 1;
        if (tries < 8) {
          requestAnimationFrame(startExpand);
          return;
        }
        finish();
        return;
      }

      const first = tileNode.getBoundingClientRect();
      const last = measureHeroTarget();
      const lastW = Math.max(last.width, 1);
      const lastH = Math.max(last.height, 1);
      const sx = first.width / lastW;
      const sy = first.height / lastH;
      const dx =
        first.left + first.width / 2 - (last.left + last.width / 2);
      const dy =
        first.top + first.height / 2 - (last.top + last.height / 2);
      const endScale = timings.endHeroScale;
      const radius = timings.radiusPx;
      const imgStart = Math.max(
        1 / Math.max(sx, 0.001),
        1 / Math.max(sy, 0.001),
      );

      const heroNode =
        document.querySelector("[data-home-hero-media] img") ||
        document.querySelector("[data-home-hero-media] video") ||
        document.querySelector("[data-home-hero-media]");
      const objectPosition = heroNode
        ? getComputedStyle(heroNode).objectPosition || "center center"
        : "center center";

      clone.style.position = "fixed";
      clone.style.left = `${last.left}px`;
      clone.style.top = `${last.top}px`;
      clone.style.width = `${last.width}px`;
      clone.style.height = `${last.height}px`;
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

      if (heroNode) heroNode.style.opacity = "0";

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
            if (heroNode) heroNode.style.opacity = "1";
            clone.style.opacity = "0";
            finish();
            requestAnimationFrame(() => {
              clone.style.display = "none";
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

  const tileWidth = isMobileStrip ? "26vw" : "14vw";
  const tileHeight = isMobileStrip ? "40vh" : "48vh";
  const centerSrc = tileSources[centerIndex]?.src || "";
  const focused = phase === "focus" || expanding;

  return createPortal(
    <div className="fixed inset-0 z-[120] bg-[#0A0820]" aria-hidden="true">
      <motion.div
        className="absolute top-[11vh] start-[7vw] flex items-center gap-3"
        initial={{ opacity: 0, y: 16 }}
        animate={
          expanding
            ? { opacity: 0, y: -8 }
            : { opacity: 1, y: 0 }
        }
        transition={{
          duration: timings.tileMs / 1000,
          delay: rtlEnterDelaySec(0, tileSources.length || 1, timings.staggerMs),
          ease: timings.ease,
        }}
      >
        <LogoTriangle className="h-8 w-9 sm:h-9 sm:w-10" />
        <span className="font-display text-[28px] font-black tracking-tight text-white sm:text-[34px]">
          كارجيل
        </span>
      </motion.div>

      {armed && phase !== "boot" ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex items-center justify-center" style={{ gap: "1.5vw" }}>
            {tileSources.map((tile, index) => {
              const isCenter = index === centerIndex;
              const enterDelay = rtlEnterDelaySec(
                index,
                tileSources.length,
                timings.staggerMs,
              );
              return (
                <motion.div
                  key={tile.id}
                  ref={isCenter ? centerRef : undefined}
                  className="relative shrink-0 overflow-hidden bg-[#110E33]"
                  style={{
                    width: tileWidth,
                    height: tileHeight,
                    maxWidth: isMobileStrip ? 200 : 220,
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
