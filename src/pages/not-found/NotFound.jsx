import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Seo from "@/components/seo/Seo";
import OrganicFloat from "@/components/ui/OrganicFloat";
import { useLocale } from "@/context/LocaleContext";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";
import { easeOut } from "@/lib/motion";

export default function NotFound() {
  const { locale } = useLocale();

  return (
    <>
      <Seo title="404" path="/404" noindex />
      <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-brand-forest-deep px-4 pt-navbar text-center">
        <OrganicFloat className="opacity-50 mix-blend-screen" />
        <motion.div
          className="relative"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: easeOut }}
        >
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-brand-lime">
            404
          </p>
          <h1 className="mb-4 text-4xl font-extrabold text-white sm:text-5xl">
            {t(UI.notFoundTitle, locale)}
          </h1>
          <p className="mb-8 max-w-md text-lg text-white/75">
            {t(UI.notFoundBody, locale)}
          </p>
          <Link
            to="/"
            className="inline-flex min-h-12 items-center justify-center rounded-md border-2 border-brand-lime px-7 py-3 font-bold text-brand-lime transition-all hover:bg-brand-lime hover:text-brand-ink"
          >
            {t(UI.backHome, locale)}
          </Link>
        </motion.div>
      </main>
    </>
  );
}
