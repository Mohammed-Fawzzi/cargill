import React, { Suspense } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Seo from "@/components/seo/Seo";
import { TriangleAccent } from "@/components/ui/TriangleMask";
import SplitArrowButton from "@/components/ui/SplitArrowButton";
import { useLocale } from "@/context/LocaleContext";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";
import { easeOut } from "@/lib/motion";

import { lazyWithRetry } from "@/lib/lazyWithRetry";

const BrandTriangle3D = lazyWithRetry(() => import("@/components/ui/BrandTriangle3D"));

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
          <div className="flex flex-wrap items-center justify-center gap-4">
            <SplitArrowButton to="/" variant="primary">
              {t(UI.nav.home, locale)}
            </SplitArrowButton>
            <SplitArrowButton to="/products" variant="secondary">
              {t(UI.nav.products, locale)}
            </SplitArrowButton>
          </div>
        </motion.div>
      </main>
    </>
  );
}
