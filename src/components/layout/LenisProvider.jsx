import React, { createContext, useContext, useEffect, useMemo, useRef } from "react";
import Lenis from "lenis";
import useMotionPrefs from "@/hooks/useMotionPrefs";

const LenisContext = createContext(null);

export function useLenis() {
  return useContext(LenisContext);
}

export default function LenisProvider({ children }) {
  const { reducedMotion } = useMotionPrefs();
  const lenisRef = useRef(null);

  useEffect(() => {
    if (reducedMotion) {
      lenisRef.current = null;
      return undefined;
    }

    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      syncTouch: false,
    });
    lenisRef.current = lenis;

    const onAnchorClick = (event) => {
      const link = event.target.closest?.('a[href^="#"]');
      if (!link) return;
      const href = link.getAttribute("href");
      if (!href || href === "#") return;
      const target = document.querySelector(href);
      if (!target) return;
      event.preventDefault();
      const navbar =
        parseFloat(
          getComputedStyle(document.documentElement).getPropertyValue(
            "--navbar-height",
          ),
        ) || 92;
      lenis.scrollTo(target, { offset: -(navbar + 24) });
    };
    document.addEventListener("click", onAnchorClick);

    let frame = 0;
    const raf = (time) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      document.removeEventListener("click", onAnchorClick);
      cancelAnimationFrame(frame);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [reducedMotion]);

  const api = useMemo(
    () => ({
      scrollTo: (target, options = {}) => {
        const lenis = lenisRef.current;
        const navbar =
          typeof window !== "undefined"
            ? parseFloat(
                getComputedStyle(document.documentElement).getPropertyValue(
                  "--navbar-height",
                ),
              ) || 92
            : 92;
        const offset = options.offset ?? -(navbar + 24);

        if (lenis) {
          lenis.scrollTo(target, {
            offset,
            duration: options.duration ?? 1.05,
            ...options,
          });
          return;
        }

        if (typeof target === "string") {
          const node = document.querySelector(target);
          node?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
          return;
        }
        if (typeof target === "number") {
          window.scrollTo({ top: target, behavior: reducedMotion ? "auto" : "smooth" });
        }
      },
      get instance() {
        return lenisRef.current;
      },
    }),
    [reducedMotion],
  );

  return (
    <LenisContext.Provider value={api}>{children}</LenisContext.Provider>
  );
}
