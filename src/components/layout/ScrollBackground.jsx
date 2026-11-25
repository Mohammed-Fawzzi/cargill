import React, { useEffect } from "react";
import useMotionPrefs from "@/hooks/useMotionPrefs";

const STOPS = [
  { at: 0, color: [10, 8, 32] },
  { at: 0.35, color: [17, 14, 51] },
  { at: 0.72, color: [17, 14, 51] },
  { at: 1, color: [24, 16, 96] },
];

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function mixColor(from, to, t) {
  return [
    Math.round(lerp(from[0], to[0], t)),
    Math.round(lerp(from[1], to[1], t)),
    Math.round(lerp(from[2], to[2], t)),
  ];
}

function colorAt(progress) {
  const p = Math.min(1, Math.max(0, progress));
  for (let i = 0; i < STOPS.length - 1; i += 1) {
    const a = STOPS[i];
    const b = STOPS[i + 1];
    if (p >= a.at && p <= b.at) {
      const local = (p - a.at) / Math.max(0.0001, b.at - a.at);
      return mixColor(a.color, b.color, local);
    }
  }
  return STOPS[STOPS.length - 1].color;
}

function toCss(rgb) {
  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
}

export default function ScrollBackground() {
  const { reducedMotion } = useMotionPrefs();

  useEffect(() => {
    const root = document.documentElement;
    let raf = 0;

    const apply = () => {
      const isLight = root.getAttribute("data-theme") === "light";
      if (isLight) {
        root.style.removeProperty("--site-scroll-bg");
        return;
      }
      const max = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      const progress = reducedMotion ? 0 : window.scrollY / max;
      root.style.setProperty("--site-scroll-bg", toCss(colorAt(progress)));
    };

    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        apply();
      });
    };

    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    const observer = new MutationObserver(onScroll);
    observer.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      observer.disconnect();
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [reducedMotion]);

  return (
    <div
      className="site-scroll-bg pointer-events-none fixed inset-0 -z-10"
      aria-hidden="true"
    />
  );
}
