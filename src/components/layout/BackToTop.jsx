import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IoChevronUp } from "react-icons/io5";
import { useLenis } from "@/components/layout/LenisProvider";
import { useLocale } from "@/context/LocaleContext";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";
import useMotionPrefs from "@/hooks/useMotionPrefs";

export default function BackToTop() {
  const { locale } = useLocale();
  const lenis = useLenis();
  const { reducedMotion } = useMotionPrefs();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const viewBottom = window.scrollY + window.innerHeight;
      const pageHeight = document.documentElement.scrollHeight;
      const nearEnd = viewBottom >= pageHeight - 280;
      const scrolledFar = window.scrollY > window.innerHeight * 0.85;
      setVisible(nearEnd || scrolledFar);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const goTop = () => {
    if (lenis?.instance) {
      lenis.scrollTo(0, { immediate: reducedMotion, offset: 0 });
      return;
    }
    window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
  };

  return (
    <AnimatePresence>
      {visible ? (
        <motion.button
          key="back-to-top"
          type="button"
          onClick={goTop}
          aria-label={t(UI.backToTop, locale)}
          initial={{ opacity: 0, y: 16, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          className="site-float fixed z-40 inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-white/12 bg-[#110E33] text-white shadow-[0_12px_32px_rgba(10,8,32,0.45)] transition-colors hover:border-brand-lime hover:bg-brand-lime hover:text-[#0A0820] sm:h-12 sm:w-12"
          style={{
            bottom:
              "max(6.25rem, calc(env(safe-area-inset-bottom, 0px) + 5.75rem))",
            insetInlineEnd: "max(0.75rem, env(safe-area-inset-right, 0px))",
          }}
        >
          <IoChevronUp className="text-xl" aria-hidden="true" />
        </motion.button>
      ) : null}
    </AnimatePresence>
  );
}
