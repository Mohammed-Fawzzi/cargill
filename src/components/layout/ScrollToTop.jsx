import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useLenis } from "@/components/layout/LenisProvider";
import useMotionPrefs from "@/hooks/useMotionPrefs";

export default function ScrollToTop() {
  const { pathname, hash } = useLocation();
  const lenis = useLenis();
  const { reducedMotion } = useMotionPrefs();

  useEffect(() => {
    if (hash) {
      const id = hash.replace("#", "");
      const timer = window.setTimeout(() => {
        const target = document.getElementById(id);
        if (!target) return;
        if (lenis?.instance) {
          lenis.scrollTo(target);
        } else {
          target.scrollIntoView({
            behavior: reducedMotion ? "auto" : "smooth",
            block: "start",
          });
        }
      }, 80);
      return () => window.clearTimeout(timer);
    }

    if (lenis?.instance) {
      lenis.scrollTo(0, { immediate: reducedMotion, offset: 0 });
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash, lenis, reducedMotion]);

  return null;
}
