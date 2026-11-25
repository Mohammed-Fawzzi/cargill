import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { animate, motion, useMotionValue } from "framer-motion";
import LogoTriangle from "@/components/ui/LogoTriangle";
import { normalizeImageUrl } from "@/lib/image";
import { useLenis } from "@/components/layout/LenisProvider";

const EASE = [0.76, 0, 0.24, 1];
const HARD_TIMEOUT_MS = 2500;
const EXPAND_AT_MS = 1000;
const FINISH_AT_MS = 1800;

function preloadImage(src) {
  return new Promise((resolve) => {
    if (!src) {
      resolve(false);
      return;
    }
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = src;
  });
}

function measureHeroTarget() {
  const node = document.querySelector("[data-home-hero-media]");
  if (!node) {
    return {
      top: 0,
      left: 0,
      width: window.innerWidth,
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
  const imagesReadyRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  const [phase, setPhase] = useState("logo");
  const [expanding, setExpanding] = useState(false);
  const [portalReady, setPortalReady] = useState(false);

  onCompleteRef.current = onComplete;

  const left = useMotionValue(0);
  const top = useMotionValue(0);
  const width = useMotionValue(0);
  const height = useMotionValue(0);
  const radius = useMotionValue(6);
  const overlayOpacity = useMotionValue(1);

  const [frozenTiles] = useState(() => tiles || []);

  const tileSources = useMemo(
    () =>
      frozenTiles.map((tile) => ({
        ...tile,
        src: normalizeImageUrl(tile.src, {
          width: tile.isHero ? 1600 : 480,
          quality: tile.isHero ? 78 : 70,
        }),
      })),
    [frozenTiles],
  );

  const isMobileStrip = tileSources.length <= 3;
  const centerIndex = useMemo(() => {
    const index = tileSources.findIndex((tile) => tile.isHero);
    return index >= 0 ? index : Math.floor(tileSources.length / 2);
  }, [tileSources]);

  const finish = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    document.documentElement.dataset.homeIntro = "done";
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
    let alive = true;
    const sources = tileSources.map((tile) => tile.src).filter(Boolean);
    Promise.all(sources.map(preloadImage)).then(() => {
      if (!alive) return;
      imagesReadyRef.current = true;
    });
    return () => {
      alive = false;
    };
  }, [tileSources]);

  useEffect(() => {
    const heroTile = tileSources.find((tile) => tile.isHero);
    if (!heroTile?.src) {
      finish();
      return undefined;
    }

    const timers = [];

    timers.push(
      window.setTimeout(() => {
        setPhase("strip");
      }, 300),
    );

    timers.push(
      window.setTimeout(() => {
        if (!imagesReadyRef.current) {
          finish();
          return;
        }
        const node = centerRef.current;
        if (!node) {
          finish();
          return;
        }

        const from = node.getBoundingClientRect();
        left.set(from.left);
        top.set(from.top);
        width.set(from.width);
        height.set(from.height);
        radius.set(6);
        setExpanding(true);
        setPhase("expand");

        const midW = Math.min(window.innerWidth * 0.6, window.innerWidth - 24);
        const midH = Math.min(window.innerHeight * 0.64, window.innerHeight - 24);
        const midLeft = (window.innerWidth - midW) / 2;
        const midTop = (window.innerHeight - midH) / 2;
        const target = measureHeroTarget();

        const mid = { duration: 0.38, ease: EASE };
        const end = { duration: 0.42, ease: EASE };

        Promise.all([
          animate(left, midLeft, mid),
          animate(top, midTop, mid),
          animate(width, midW, mid),
          animate(height, midH, mid),
        ])
          .then(() =>
            Promise.all([
              animate(left, target.left, end),
              animate(top, target.top, end),
              animate(width, target.width, end),
              animate(height, target.height, end),
              animate(radius, 0, end),
            ]),
          )
          .catch(() => {});
      }, EXPAND_AT_MS),
    );

    timers.push(
      window.setTimeout(() => {
        animate(overlayOpacity, 0, { duration: 0.16, ease: EASE })
          .then(() => finish())
          .catch(() => finish());
      }, FINISH_AT_MS),
    );

    timers.push(
      window.setTimeout(() => {
        finish();
      }, HARD_TIMEOUT_MS),
    );

    return () => {
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [tileSources, left, top, width, height, radius, overlayOpacity]);

  if (!portalReady) return null;

  const stripIn = phase === "strip" || phase === "expand";
  const sideOut = phase === "expand";
  const tileWidth = isMobileStrip ? "26vw" : "14vw";
  const tileHeight = isMobileStrip ? "40vh" : "48vh";

  return createPortal(
    <motion.div
      className="fixed inset-0 z-[120] bg-[#0A0820]"
      style={{ opacity: overlayOpacity }}
      aria-hidden="true"
    >
      <motion.div
        className="absolute top-[11vh] start-[7vw] flex items-center gap-3"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={
          sideOut
            ? { opacity: 0, x: 20, scale: 0.96 }
            : { opacity: 1, scale: 1, x: 0 }
        }
        transition={{ duration: 0.3, ease: EASE }}
      >
        <LogoTriangle className="h-8 w-9 sm:h-9 sm:w-10" />
        <span className="font-display text-[28px] font-black tracking-tight text-white sm:text-[34px]">
          كارجيل
        </span>
      </motion.div>

      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="flex items-center justify-center"
          style={{ gap: "1.5vw" }}
          initial={{ x: "34vw" }}
          animate={{ x: stripIn ? 0 : "34vw" }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          {tileSources.map((tile, index) => {
            const fromCenter = index - centerIndex;
            const isCenter = index === centerIndex;
            const imageDelay = 0.06 + index * 0.06;

            if (isCenter && expanding) {
              return (
                <div
                  key={`${tile.id}-slot`}
                  className="shrink-0"
                  style={{
                    width: tileWidth,
                    height: tileHeight,
                    maxWidth: isMobileStrip ? 200 : 220,
                  }}
                />
              );
            }

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
                }}
                initial={{ opacity: 1, x: 0 }}
                animate={
                  sideOut && !isCenter
                    ? {
                        opacity: 0,
                        x: fromCenter < 0 ? -40 : 40,
                      }
                    : { opacity: 1, x: 0 }
                }
                transition={{ duration: 0.3, ease: EASE }}
              >
                {tile.src ? (
                  <motion.img
                    src={tile.src}
                    alt=""
                    className="h-full w-full object-cover"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: stripIn ? 1 : 0 }}
                    transition={{
                      duration: 0.2,
                      delay: stripIn ? imageDelay : 0,
                      ease: "linear",
                    }}
                    draggable={false}
                  />
                ) : null}
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {expanding ? (
        <motion.div
          className="pointer-events-none fixed z-[121] overflow-hidden bg-[#110E33]"
          style={{
            left,
            top,
            width,
            height,
            borderRadius: radius,
          }}
        >
          <img
            src={tileSources[centerIndex]?.src || ""}
            alt=""
            className="h-full w-full object-cover"
            draggable={false}
          />
        </motion.div>
      ) : null}
    </motion.div>,
    document.body,
  );
}
