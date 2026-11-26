import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { animate, motion } from "framer-motion";
import LogoTriangle from "@/components/ui/LogoTriangle";
import { useLenis } from "@/components/layout/LenisProvider";
import {
  INTRO_EASE,
  INTRO_EXPAND_MS,
  INTRO_FOCUS_MS,
  INTRO_PRELOAD_MAX_MS,
  INTRO_STAGGER_MS,
  INTRO_TILE_MS,
  normalizeIntroSrc,
  preloadImages,
} from "@/lib/introMedia";

function staggerDelay(index, centerIndex) {
  return (Math.abs(index - centerIndex) * INTRO_STAGGER_MS) / 1000;
}

function outwardX(index, centerIndex) {
  if (index === centerIndex) return 0;
  return index < centerIndex ? "-4vw" : "4vw";
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
  const onCompleteRef = useRef(onComplete);
  const [phase, setPhase] = useState("boot");
  const [expanding, setExpanding] = useState(false);
  const [portalReady, setPortalReady] = useState(false);
  const [armed, setArmed] = useState(false);
  const [frozenTiles, setFrozenTiles] = useState(null);

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

  const finish = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    document.documentElement.dataset.homeIntro = "revealing";
    window.setTimeout(() => {
      document.documentElement.dataset.homeIntro = "done";
    }, 520);
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
    preloadImages(sources, INTRO_PRELOAD_MAX_MS).finally(() => {
      if (!alive) return;
      setFrozenTiles(next);
      setArmed(true);
    });
    return () => {
      alive = false;
    };
  }, [tiles, frozenTiles]);

  useEffect(() => {
    if (!armed) return undefined;
    if (!tileSources.some((tile) => tile.isHero && tile.src)) {
      finish();
      return undefined;
    }
    setPhase("in");
    const focusAt = INTRO_TILE_MS + centerIndex * INTRO_STAGGER_MS + 80;
    const expandAt = focusAt + INTRO_FOCUS_MS + 120;
    const timers = [];
    timers.push(window.setTimeout(() => setPhase("focus"), focusAt));
    timers.push(window.setTimeout(() => setExpanding(true), expandAt));
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [armed, tileSources, centerIndex]);

  useLayoutEffect(() => {
    if (!expanding || finishedRef.current) return undefined;
    const tileNode = centerRef.current;
    const clone = cloneRef.current;
    if (!tileNode || !clone) {
      finish();
      return undefined;
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
    clone.style.objectFit = "cover";
    clone.style.objectPosition = objectPosition;
    clone.style.transformOrigin = "center center";
    clone.style.borderRadius = "6px";
    clone.style.zIndex = "122";
    clone.style.willChange = "transform, border-radius";
    clone.style.transform = `translate3d(${dx}px, ${dy}px, 0) scale(${sx}, ${sy})`;

    if (heroNode) heroNode.style.opacity = "0";

    const run = animate(0, 1, {
      duration: INTRO_EXPAND_MS / 1000,
      ease: INTRO_EASE,
      onUpdate: (t) => {
        const tx = dx * (1 - t);
        const ty = dy * (1 - t);
        const scaleX = sx + (1 - sx) * t;
        const scaleY = sy + (1 - sy) * t;
        clone.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(${scaleX}, ${scaleY})`;
        clone.style.borderRadius = `${6 * (1 - t)}px`;
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

    return () => run.stop();
  }, [expanding]);

  if (!portalReady) return null;

  const tileWidth = isMobileStrip ? "26vw" : "14vw";
  const tileHeight = isMobileStrip ? "40vh" : "48vh";
  const centerSrc = tileSources[centerIndex]?.src || "";

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
        transition={{ duration: 0.4, ease: INTRO_EASE }}
      >
        <LogoTriangle className="h-8 w-9 sm:h-9 sm:w-10" />
        <span className="font-display text-[28px] font-black tracking-tight text-white sm:text-[34px]">
          كارجيل
        </span>
      </motion.div>

      {armed ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex items-center justify-center" style={{ gap: "1.5vw" }}>
            {tileSources.map((tile, index) => {
              const isCenter = index === centerIndex;
              const focused = phase === "focus" || expanding;
              return (
                <motion.div
                  key={tile.id}
                  ref={isCenter ? centerRef : undefined}
                  className="relative shrink-0 overflow-hidden bg-[#110E33]"
                  style={{
                    width: tileWidth,
                    height: tileHeight,
                    maxWidth: isMobileStrip ? 200 : 220,
                    borderRadius: 6,
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
