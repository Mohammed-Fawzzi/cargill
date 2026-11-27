import { useEffect, useState } from "react";

function readPrefs() {
  if (typeof window === "undefined") {
    return { reducedMotion: true, finePointer: false, canTilt: false };
  }
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  return {
    reducedMotion,
    finePointer,
    canTilt: !reducedMotion,
  };
}

export default function useMotionPrefs() {
  const [prefs, setPrefs] = useState(readPrefs);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sync = () => setPrefs(readPrefs());
    sync();
    reduced.addEventListener("change", sync);
    fine.addEventListener("change", sync);
    return () => {
      reduced.removeEventListener("change", sync);
      fine.removeEventListener("change", sync);
    };
  }, []);

  return prefs;
}
