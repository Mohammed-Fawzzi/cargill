import React from "react";
import { useLocale } from "@/context/LocaleContext";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";

export default function RegistrationBadge({ number, className = "" }) {
  const { locale } = useLocale();
  const value = String(number || "").trim();
  if (!value) return null;

  return (
    <p
      className={`inline-flex items-center gap-2 border border-white/10 bg-[#1B1931] px-2.5 py-1.5 text-[11px] text-white/60 ${className}`}
    >
      <span className="h-1.5 w-1.5 bg-brand-lime" aria-hidden="true" />
      <span>
        {t(UI.registrationBadge, locale).replace("{n}", value)}
      </span>
    </p>
  );
}
