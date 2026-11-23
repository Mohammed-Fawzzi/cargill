import React from "react";
import { useLocale } from "@/context/LocaleContext";

export default function LanguageSwitch({ compact = false }) {
  const { locale, setLocale } = useLocale();

  const buttonClass = (active) =>
    `rounded-md px-2 py-1 text-xs font-bold transition-colors sm:text-sm ${
      active
        ? "bg-brand-lime text-brand-black"
        : "text-white/80 hover:text-brand-lime"
    }`;

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 p-0.5 ${
        compact ? "" : ""
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
