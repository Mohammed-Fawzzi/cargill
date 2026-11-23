import React from "react";
import SiteLogo from "@/components/ui/SiteLogo";
import { useLocale } from "@/context/LocaleContext";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";

export default function Loading({ label }) {
  const { locale } = useLocale();
  const text = label || t(UI.loading, locale);

  return (
    <div
      className="fixed inset-0 z-10 flex flex-col items-center justify-center bg-brand-black px-4"
      role="status"
      aria-live="polite"
      aria-label={text}
    >
      <div className="loading-logo-pulse flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-[1.75rem] bg-brand-forest shadow-[0_12px_40px_rgba(0,0,0,0.28)] sm:h-32 sm:w-32">
        <SiteLogo
          alt={text}
          loading="eager"
          className="h-[5.5rem] w-auto max-w-[6.5rem] object-contain sm:h-[6.5rem]"
        />
      </div>
      <div className="mt-5 flex h-2 items-center gap-1.5" aria-hidden="true">
        {[0, 1, 2].map((dot) => (
          <span
            key={dot}
            className="loading-dot-pulse inline-block h-2 w-2 rounded-full bg-brand-lime"
            style={{ animationDelay: `${dot * 0.18}s` }}
          />
        ))}
      </div>
      <span className="sr-only">{text}</span>
    </div>
  );
}
