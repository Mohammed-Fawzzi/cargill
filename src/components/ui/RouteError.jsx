import React, { useEffect } from "react";
import { useRouteError } from "react-router-dom";
import { useLocale } from "@/context/LocaleContext";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";
import { clearChunkReload, reloadForChunkError } from "@/lib/lazyWithRetry";

export default function RouteError() {
  const error = useRouteError();
  const { locale } = useLocale();

  useEffect(() => {
    reloadForChunkError(error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#0A0820] px-6 text-center text-white">
      <p className="max-w-md text-lg leading-relaxed">{t(UI.error, locale)}</p>
      <button
        type="button"
        className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-brand-lime px-6 text-sm font-bold text-[#0A0820]"
        onClick={() => {
          clearChunkReload();
          window.location.reload();
        }}
      >
        {t(UI.reload, locale)}
      </button>
    </main>
  );
}
