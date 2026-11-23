import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IoClose } from "react-icons/io5";
import { MdEmail } from "react-icons/md";
import { HiOutlineChatAlt2 } from "react-icons/hi";
import { FaMobile } from "react-icons/fa6";
import { useSiteData } from "@/context/SiteDataContext";
import { useLocale } from "@/context/LocaleContext";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";

const btnBase =
  "relative z-[1] inline-flex h-11 w-11 items-center justify-center rounded-full shadow-[0_10px_28px_rgba(0,0,0,0.28)] transition-transform hover:scale-[1.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime/70 sm:h-12 sm:w-12";

export default function FloatingCta() {
  const { contact } = useSiteData();
  const { locale } = useLocale();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const phone = contact?.phones?.[0] || "";
  const email = contact?.emails?.[0] || "";
  const phoneHref = phone ? `tel:${phone.replace(/\s+/g, "")}` : "";
  const emailHref = email ? `mailto:${email}` : "";

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!phoneHref && !emailHref) return null;

  return (
    <div
      ref={rootRef}
      className="pointer-events-none fixed z-40 flex flex-col items-center gap-2.5 sm:gap-3"
      style={{
        bottom: "max(1.25rem, env(safe-area-inset-bottom, 0px))",
        insetInlineStart: "max(1rem, env(safe-area-inset-left, 0px))",
      }}
    >
      <AnimatePresence initial={false}>
        {open && emailHref ? (
          <motion.a
            key="email"
            href={emailHref}
            initial={{ opacity: 0, y: 16, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            className={`pointer-events-auto ${btnBase} bg-brand-forest text-white ring-1 ring-brand-lime/35`}
            aria-label={t(UI.email, locale)}
          >
            <MdEmail className="text-lg" />
          </motion.a>
        ) : null}
      </AnimatePresence>

      <div className="pointer-events-auto flex flex-col items-center gap-3">
        <motion.button
          type="button"
          aria-label={t(UI.nav.contact, locale)}
          onClick={() => setOpen((prev) => !prev)}
          className={`${btnBase} bg-brand-black text-white ring-1 ring-brand-lime/35`}
        >
          {open ? (
            <IoClose className="text-xl" />
          ) : (
            <HiOutlineChatAlt2 className="text-xl" />
          )}
        </motion.button>
        {phoneHref ? (
          <a
            href={phoneHref}
            aria-label={t(UI.phone, locale)}
            className={`${btnBase} bg-brand-lime text-brand-black`}
          >
            <FaMobile className="text-lg" />
          </a>
        ) : null}
      </div>
    </div>
  );
}
