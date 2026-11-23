import React from "react";
import { Link } from "react-router-dom";
import Seo from "@/components/seo/Seo";
import { useLocale } from "@/context/LocaleContext";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";

export default function NotFound() {
  const { locale } = useLocale();

  return (
    <>
      <Seo title="404" path="/404" noindex />
      <main className="flex min-h-screen flex-col items-center justify-center bg-brand-black px-4 pt-navbar text-center text-brand-lime">
        <h1 className="mb-4 text-4xl font-extrabold">
          404 - {t(UI.notFoundTitle, locale)}
        </h1>
        <p className="mb-8 text-lg text-white/80">{t(UI.notFoundBody, locale)}</p>
        <Link
          to="/"
          className="border-2 border-brand-lime px-6 py-2 font-bold text-brand-lime transition-colors hover:bg-brand-lime hover:text-brand-black"
        >
          {t(UI.backHome, locale)}
        </Link>
      </main>
    </>
  );
}
