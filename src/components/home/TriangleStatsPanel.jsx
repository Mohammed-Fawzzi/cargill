import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, useScroll, useTransform } from "framer-motion";
import MonoLabel from "@/components/ui/MonoLabel";
import AmbientGlow from "@/components/ui/AmbientGlow";
import { TriangleAccent } from "@/components/ui/TriangleMask";
import { useLocale } from "@/context/LocaleContext";
import { getArticles } from "@/services/cms/articles";
import { getEvents } from "@/services/cms/events";
import { getCategories, getProducts } from "@/services/cms/products";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";
import { easeOut } from "@/lib/motion";
import useMotionPrefs from "@/hooks/useMotionPrefs";

import { lazyWithRetry } from "@/lib/lazyWithRetry";

const BrandTriangle3D = lazyWithRetry(() => import("@/components/ui/BrandTriangle3D"));

export default function TriangleStatsPanel() {
  const { locale } = useLocale();
  const { reducedMotion } = useMotionPrefs();
  const panelRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: panelRef,
    offset: ["start end", "end start"],
  });
  const scrollTwist = useTransform(scrollYProgress, [0, 1], [0, 30]);

  const productsQuery = useQuery({
    queryKey: ["cms", "products"],
    queryFn: getProducts,
    staleTime: 1000 * 60 * 5,
  });
  const categoriesQuery = useQuery({
    queryKey: ["cms", "categories"],
    queryFn: getCategories,
    staleTime: 1000 * 60 * 5,
  });
  const articlesQuery = useQuery({
    queryKey: ["cms", "articles"],
    queryFn: getArticles,
    staleTime: 1000 * 60 * 5,
  });
  const eventsQuery = useQuery({
    queryKey: ["cms", "events"],
    queryFn: getEvents,
    staleTime: 1000 * 60 * 5,
  });

  const stats = useMemo(() => {
    const products = productsQuery.data?.length || 0;
    const categories = categoriesQuery.data?.length || 0;
    const articles = articlesQuery.data?.length || 0;
    const events = eventsQuery.data?.length || 0;
    return [
      { value: "+20", label: t(UI.experienceBody, locale) },
      products > 0
        ? { value: String(products), label: t(UI.nav.products, locale) }
        : null,
      categories > 0
        ? { value: String(categories), label: t(UI.allCategories, locale) }
        : null,
      articles > 0
        ? { value: String(articles), label: t(UI.nav.articles, locale) }
        : null,
      events > 0
        ? { value: String(events), label: t(UI.nav.events, locale) }
        : null,
    ]
      .filter(Boolean)
      .slice(0, 4);
  }, [
    productsQuery.data,
    categoriesQuery.data,
    articlesQuery.data,
    eventsQuery.data,
    locale,
  ]);

  const [twistValue, setTwistValue] = useState(0);
  useEffect(() => {
    if (reducedMotion) {
      setTwistValue(0);
      return undefined;
    }
    return scrollTwist.on("change", (value) => setTwistValue(value));
  }, [scrollTwist, reducedMotion]);

  return (
    <section className="bg-page px-4 py-[4.5rem] lg:px-8 lg:py-[7rem]">
      <div
        ref={panelRef}
        className="relative mx-auto min-h-[28rem] max-w-[1400px] overflow-hidden rounded-[24px] border border-line/12 bg-surface sm:min-h-[34rem]"
      >
        <AmbientGlow className="start-1/2 top-1/2 h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 rtl:translate-x-1/2" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Suspense
            fallback={
              <TriangleAccent className="h-[55%] w-[55%] max-w-md opacity-40" />
            }
          >
            <BrandTriangle3D
              className="h-[60%] min-h-[14rem] w-[60%] max-w-xl"
              scrollTwist={twistValue}
              softLight
              spin={0.12}
              followMouse={false}
            />
          </Suspense>
        </div>

        <div className="relative z-10 flex h-full flex-col justify-between p-5 sm:p-8 lg:p-10">
          <MonoLabel className="text-brand-lime/80">
            {t(UI.triangleStatsLabel, locale)}
          </MonoLabel>

          <div className="mt-auto grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
            {stats.map((stat, index) => (
              <motion.article
                key={`${stat.label}-${stat.value}`}
                className="border border-white/10 bg-[rgba(17,14,51,0.7)] p-4 backdrop-blur-md sm:p-5"
                initial={reducedMotion ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.08,
                  ease: easeOut,
                }}
              >
                <p className="text-3xl font-extrabold tracking-tight text-brand-lime sm:text-4xl">
                  {stat.value}
                </p>
                <p className="mt-2 text-xs leading-6 text-ink/65 sm:text-sm">
                  {stat.label}
                </p>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
