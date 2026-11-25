import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import useMotionPrefs from "@/hooks/useMotionPrefs";

export default function ScrollProgress() {
  const { pathname } = useLocation();
  const { reducedMotion } = useMotionPrefs();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress(0);
  }, [pathname]);

  useEffect(() => {
    if (reducedMotion) return undefined;

    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      setProgress(max > 0 ? doc.scrollTop / max : 0);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [reducedMotion, pathname]);

  if (reducedMotion) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[2px] bg-transparent"
      aria-hidden="true"
    >
      <div
        className="h-full origin-left bg-brand-lime transition-[width] duration-75 ease-out"
        style={{ width: `${Math.min(1, Math.max(0, progress)) * 100}%` }}
      />
    </div>
  );
}
