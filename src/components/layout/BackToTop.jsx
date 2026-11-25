import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IoChevronUp } from "react-icons/io5";
import { useLocale } from "@/context/LocaleContext";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";

export default function BackToTop() {
  const { locale } = useLocale();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const viewBottom = window.scrollY + window.innerHeight;
      const pageHeight = document.documentElement.scrollHeight;
      const nearEnd = viewBottom >= pageHeight - 220;
      const scrolledFar = window.scrollY > 700;
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
    window.scrollTo({ top: 0, behavior: "smooth" });
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
          className="fixed z-40 inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-brand-navy text-white shadow-[0_12px_32px_rgba(24,16,96,0.28)] transition-colors hover:bg-brand-lime hover:text-brand-navy sm:h-12 sm:w-12"
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
