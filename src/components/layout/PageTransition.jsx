import React, { useEffect, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import useMotionPrefs from "@/hooks/useMotionPrefs";
import { easeOut } from "@/lib/motion";

export default function PageTransition() {
  const location = useLocation();
  const { reducedMotion } = useMotionPrefs();
  const firstLoad = useRef(true);
  const [wipe, setWipe] = useState(null);

  useEffect(() => {
    if (firstLoad.current) {
      firstLoad.current = false;
      return undefined;
    }
    if (reducedMotion) {
      setWipe(null);
      return undefined;
    }

    setWipe("in");
    const mid = window.setTimeout(() => setWipe("out"), 350);
    const end = window.setTimeout(() => setWipe(null), 720);
    return () => {
      window.clearTimeout(mid);
      window.clearTimeout(end);
    };
  }, [location.pathname, reducedMotion]);

  const active = Boolean(wipe);

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col">
        <Outlet />
      </div>

      <AnimatePresence>
        {active ? (
          <motion.div
            key="page-wipe"
            className="pointer-events-none fixed inset-0 z-[60] bg-brand-forest-deep"
            style={{ visibility: active ? "visible" : "hidden" }}
            initial={{
              clipPath: "polygon(0% 0%, 0% 0%, -20% 100%, -20% 100%)",
            }}
            animate={
              wipe === "in"
                ? {
                    clipPath: "polygon(0% 0%, 100% 0%, 120% 100%, 0% 100%)",
                  }
                : {
                    clipPath: "polygon(100% 0%, 100% 0%, 120% 100%, 120% 100%)",
                  }
            }
            exit={{
              clipPath: "polygon(100% 0%, 100% 0%, 120% 100%, 120% 100%)",
              opacity: 0,
            }}
            transition={{ duration: 0.35, ease: easeOut }}
            aria-hidden="true"
          />
        ) : null}
      </AnimatePresence>
    </>
  );
}
