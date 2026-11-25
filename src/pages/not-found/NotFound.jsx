import React, { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import Seo from "@/components/seo/Seo";
import { TriangleAccent } from "@/components/ui/TriangleMask";
import { useLocale } from "@/context/LocaleContext";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";
import { easeOut } from "@/lib/motion";

const BrandTriangle3D = lazy(() => import("@/components/ui/BrandTriangle3D"));

export default function NotFound() {
  const { locale } = useLocale();
  const reduceMotion = useReducedMotion();

  return (
    <>
      <Seo title="404" path="/404" noindex />
      <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-brand-forest-deep px-4 pt-navbar text-center text-white">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-40">
          <Suspense
            fallback={<TriangleAccent className="h-40 w-48 opacity-40" />}
          >
            <BrandTriangle3D className="h-48 w-56 sm:h-60 sm:w-72" />
          </Suspense>
        </div>

        <motion.div
          className="relative z-10 max-w-xl"
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: easeOut }}
        >
          <p className="mb-4 text-[11px] font-bold tracking-[0.22em] text-brand-lime">
            404
          </p>
          <h1 className="mb-8 text-[clamp(2rem,6vw,3.5rem)] font-extrabold leading-tight">
            {t(UI.notFoundTitle, locale)}
          </h1>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link
              to="/"
              className="inline-flex min-h-11 items-center justify-center bg-brand-lime px-6 text-sm font-extrabold text-brand-ink transition-colors hover:bg-brand-lime-hover"
            >
              {t(UI.nav.home, locale)}
            </Link>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 border-b-2 border-brand-lime pb-0.5 text-sm font-bold text-white"
            >
              {t(UI.nav.products, locale)}
              <span aria-hidden="true">←</span>
            </Link>
          </div>
        </motion.div>
      </main>
    </>
  );
}
