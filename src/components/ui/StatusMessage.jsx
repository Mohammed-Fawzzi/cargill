import React from "react";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";
import { useLocale } from "@/context/LocaleContext";

export function EmptyState({ message }) {
  const { locale } = useLocale();
  return (
    <p className="px-4 py-16 text-center text-sm text-text-muted">
      {message || t(UI.empty, locale)}
    </p>
  );
}

export function ErrorState({ message, onRetry }) {
  const { locale } = useLocale();
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 px-4 text-center">
      <p className="text-sm text-text-muted sm:text-base">
        {message || t(UI.error, locale)}
      </p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-full bg-brand-black px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-brand-forest"
        >
          {t(UI.retry, locale)}
        </button>
      ) : null}
    </div>
  );
}

export function PageShell({ children, className = "" }) {
  return (
    <main className={`pt-navbar min-h-screen bg-surface ${className}`}>
      {children}
    </main>
  );
}
