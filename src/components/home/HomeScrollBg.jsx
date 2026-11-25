import { useEffect } from "react";
import useMotionPrefs from "@/hooks/useMotionPrefs";

const DEFAULT_BG = "#0A0820";

export default function HomeScrollBg() {
  const { reducedMotion } = useMotionPrefs();

  useEffect(() => {
    const app = document.querySelector(".App");
    if (!app) return undefined;

    app.style.setProperty(
      "--page-bg-transition",
      reducedMotion
        ? "none"
        : "background-color 700ms cubic-bezier(0.22, 1, 0.36, 1)",
    );
    app.style.setProperty("--page-bg", DEFAULT_BG);

    const ratios = new Map();
    let observer = null;
    let lastKey = "";

    const pick = () => {
      let best = null;
      let bestRatio = 0;
      for (const [node, ratio] of ratios) {
        if (!node.isConnected) continue;
        if (ratio >= 0.4 && ratio > bestRatio) {
          bestRatio = ratio;
          best = node;
        }
      }
      const color = best?.getAttribute("data-home-bg") || DEFAULT_BG;
      app.style.setProperty("--page-bg", color);
      document.documentElement.style.setProperty("--site-scroll-bg", color);
    };

    const bind = () => {
      const nodes = Array.from(document.querySelectorAll("[data-home-bg]"));
      const key = nodes
        .map((node) => `${node.getAttribute("data-home-bg")}:${nodes.indexOf(node)}`)
        .join("|");
      if (key === lastKey && observer) return;
      lastKey = key;
      observer?.disconnect();
      ratios.clear();
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            ratios.set(entry.target, entry.intersectionRatio);
          }
          pick();
        },
        { threshold: [0, 0.25, 0.4, 0.55, 0.7, 1] },
      );
      nodes.forEach((node) => observer.observe(node));
      pick();
    };

    bind();
    const mo = new MutationObserver(() => {
      window.requestAnimationFrame(bind);
    });
    mo.observe(app, { childList: true, subtree: true });

    return () => {
      observer?.disconnect();
      mo.disconnect();
      app.style.setProperty("--page-bg", DEFAULT_BG);
      document.documentElement.style.setProperty("--site-scroll-bg", DEFAULT_BG);
    };
  }, [reducedMotion]);

  return null;
}
