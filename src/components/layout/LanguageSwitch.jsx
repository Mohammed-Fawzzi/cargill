import React, { useEffect, useRef, useState } from "react";
import { IoChevronDown } from "react-icons/io5";
import { useLocale } from "@/context/LocaleContext";
import { UI } from "@/data/uiCopy";
import { t } from "@/lib/i18n";

export default function LanguageSwitch({
  compact = false,
  variant = "pills",
  tone = "dark",
}) {
  const { locale, setLocale } = useLocale();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const otherLocale = locale === "ar" ? "en" : "ar";
  const light = tone === "light";

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

  if (variant === "menu") {
    return (
      <div ref={rootRef} className="relative">
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/85 transition-colors hover:text-brand-lime sm:text-sm"
          aria-expanded={open}
          aria-haspopup="listbox"
          onClick={() => setOpen((value) => !value)}
        >
          <span>{t(UI.language, locale)}</span>
          <IoChevronDown
            className={`text-sm transition-transform ${open ? "rotate-180" : ""}`}
            aria-hidden="true"
          />
        </button>
        {open ? (
          <ul
            role="listbox"
            className="absolute start-0 top-full z-30 mt-2 min-w-[8.5rem] overflow-hidden rounded-md border border-white/10 bg-brand-forest-deep py-1 shadow-lg"
          >
            <li>
              <button
                type="button"
                role="option"
                aria-selected={true}
                className="flex w-full px-3 py-2 text-start text-sm font-semibold text-brand-lime"
                onClick={() => setOpen(false)}
              >
                {t(UI.language, locale)}
              </button>
            </li>
            <li>
              <button
                type="button"
                role="option"
                aria-selected={false}
                className="flex w-full px-3 py-2 text-start text-sm font-semibold text-white/85 transition-colors hover:bg-white/5 hover:text-brand-lime"
                onClick={() => {
                  setLocale(otherLocale);
                  setOpen(false);
                }}
              >
                {t(UI.language, otherLocale)}
              </button>
            </li>
          </ul>
        ) : null}
      </div>
    );
  }

  const buttonClass = (active) =>
    `rounded-md font-bold transition-colors ${
      compact ? "px-1.5 py-0.5 text-[11px]" : "px-2 py-1 text-xs sm:text-sm"
    } ${
      active
        ? "bg-brand-lime text-brand-ink"
        : light
          ? "text-brand-ink/70 hover:text-brand-lime"
          : "text-white/80 hover:text-brand-lime"
    }`;

  return (
    <div
      className={`inline-flex items-center rounded-lg ${
        compact ? "gap-0.5 p-0.5" : "gap-1 p-0.5"
      } ${
        light
          ? "border border-brand-ink/10 bg-brand-ink/5"
          : "border border-white/10 bg-white/5"
      }`}
      role="group"
      aria-label="Language"
    >
      <button
        type="button"
        className={buttonClass(locale === "ar")}
        onClick={() => setLocale("ar")}
      >
        AR
      </button>
      <button
        type="button"
        className={buttonClass(locale === "en")}
        onClick={() => setLocale("en")}
      >
        EN
      </button>
    </div>
  );
}
