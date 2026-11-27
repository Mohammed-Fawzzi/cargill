import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, useScroll } from "framer-motion";
import LogoTriangle from "@/components/ui/LogoTriangle";
import AccentHeading from "@/components/ui/AccentHeading";
import ScrollWords from "@/components/ui/ScrollWords";
import { useLocale } from "@/context/LocaleContext";
import { useSiteData } from "@/context/SiteDataContext";
import { getArticles } from "@/services/cms/articles";
import { getCategories, getProducts } from "@/services/cms/products";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";
import { easeOut } from "@/lib/motion";
import useCountUp from "@/hooks/useCountUp";
import useMotionPrefs from "@/hooks/useMotionPrefs";

import { lazyWithRetry } from "@/lib/lazyWithRetry";

const BrandTriangle3D = lazyWithRetry(() => import("@/components/ui/BrandTriangle3D"));

function StatValue({ target, reducedMotion }) {
  const ref = useRef(null);
  const [active, setActive] = useState(false);
  const counted = useCountUp(target, active && target > 0, 900);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref}>{reducedMotion ? target : counted}</span>
  );
}

export default function ValuesTrio() {
  const { locale } = useLocale();
  const { contact } = useSiteData();
  const { reducedMotion } = useMotionPrefs();
  const paragraphRef = useRef(null);
  const cardRef = useRef(null);
  const [active, setActive] = useState(false);

  const about = t(contact?.about, locale);
  const heading = t(UI.valuesTitle, locale);

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

  const stats = useMemo(() => {
    const products = productsQuery.data?.length || 0;
    const categories = categoriesQuery.data?.length || 0;
    const articles = articlesQuery.data?.length || 0;
    return [
      products > 0
        ? { value: products, label: t(UI.nav.products, locale) }
        : null,
      categories > 0
        ? { value: categories, label: t(UI.allCategories, locale) }
        : null,
      articles > 0
        ? { value: articles, label: t(UI.nav.articles, locale) }
        : null,
    ].filter(Boolean);
  }, [
    productsQuery.data,
    categoriesQuery.data,
    articlesQuery.data,
    locale,
  ]);

  const lead = stats[0];
  const rest = stats.slice(1);

  const { scrollYProgress } = useScroll({
    target: paragraphRef,
    offset: ["start 0.85", "end 0.35"],
  });

  useEffect(() => {
    const node = cardRef.current;
    if (!node) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  if (!about && !heading) return null;

  return (
    <motion.section
      data-home-bg="#0A0820"
      className="relative bg-transparent py-20 md:py-24"
      initial={reducedMotion ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.5, ease: easeOut }}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          <div
            ref={cardRef}
            className="relative order-2 overflow-hidden rounded-3xl border border-white/8 bg-[#110E33] p-8 shadow-[0_24px_60px_rgba(10,8,32,0.45)] lg:order-1 lg:col-span-5"
          >
            <div
              className="pointer-events-none absolute -start-12 -bottom-12 h-64 w-64 opacity-10"
              aria-hidden="true"
            >
              <LogoTriangle className="h-full w-full" />
            </div>

            <div className="relative mb-8 h-20 w-20">
              {reducedMotion ? (
                <LogoTriangle className="h-full w-full drop-shadow-lg" />
              ) : (
                <Suspense
                  fallback={
                    <LogoTriangle className="h-full w-full drop-shadow-lg" />
                  }
                >
                  <BrandTriangle3D
                    className="h-full w-full"
                    softLight
                    spin={0.18}
                    followMouse
                  />
                </Suspense>
              )}
            </div>

            {lead ? (
              <div className="relative space-y-5">
                <div className="space-y-2">
                  <p
                    className="font-display text-6xl font-bold tracking-tight text-brand-lime md:text-7xl"
                    dir="ltr"
                  >
                    <StatValue
                      target={lead.value}
                      reducedMotion={reducedMotion}
                    />
                  </p>
                  <h3 className="font-display text-xl font-bold text-white">
                    {lead.label}
                  </h3>
                </div>
                {rest.length ? (
                  <div className="grid grid-cols-2 gap-3 border-t border-white/10 pt-4">
                    {rest.map((item) => (
                      <div key={item.label}>
                        <p
                          className="font-display text-2xl font-bold text-brand-lime"
                          dir="ltr"
                        >
                          <StatValue
                            target={item.value}
                            reducedMotion={reducedMotion}
                          />
                        </p>
                        <p className="mt-1 text-xs text-white/55">{item.label}</p>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="order-1 space-y-6 lg:order-2 lg:col-span-7">
            <motion.p
              className="text-xs font-medium tracking-wide text-brand-lime"
              initial={reducedMotion ? false : { opacity: 0, y: 6 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.4, ease: easeOut }}
            >
              {t(UI.whoWeAre, locale)}
            </motion.p>

            {heading ? (
              <motion.div
                initial={reducedMotion ? false : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.45, ease: easeOut, delay: reducedMotion ? 0 : 0.12 }}
              >
                <AccentHeading
                  as="h2"
                  text={heading}
                  className="font-display text-3xl font-bold leading-tight text-white md:text-5xl"
                />
              </motion.div>
            ) : null}

            {about ? (
              <div ref={paragraphRef}>
                <ScrollWords
                  text={about}
                  progress={scrollYProgress}
                  reducedMotion={reducedMotion}
                  accentPhrase
                  className="text-base font-medium leading-relaxed text-white/62 md:text-lg"
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
