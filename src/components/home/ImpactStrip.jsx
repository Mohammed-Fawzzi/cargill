import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Reveal from "@/components/ui/Reveal";
import StatValue from "@/components/home/StatValue";
import { useLocale } from "@/context/LocaleContext";
import { useSiteData } from "@/context/SiteDataContext";
import { getArticles } from "@/services/cms/articles";
import { getEvents } from "@/services/cms/events";
import { getCategories, getProducts } from "@/services/cms/products";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";
import { easeOut } from "@/lib/motion";

export default function ImpactStrip({ title: titleProp, eyebrow: eyebrowProp } = {}) {
  const { locale } = useLocale();
  const { contact, footer } = useSiteData();
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

  const eyebrow = eyebrowProp || t(UI.cultivateEvolve, locale);
  const title =
    titleProp ||
    t(footer?.body, locale) ||
    t(contact?.about, locale) ||
    t(UI.impactTitle, locale);

  const stats = useMemo(() => {
    const products = productsQuery.data?.length || 0;
    const categories = categoriesQuery.data?.length || 0;
    const articles = articlesQuery.data?.length || 0;
    const events = eventsQuery.data?.length || 0;
    return [
      { value: products, label: t(UI.nav.products, locale) },
      { value: categories, label: t(UI.allCategories, locale) },
      { value: articles, label: t(UI.nav.articles, locale) },
      { value: events, label: t(UI.nav.events, locale) },
    ].filter((item) => item.value > 0);
  }, [
    productsQuery.data,
    categoriesQuery.data,
    articlesQuery.data,
    eventsQuery.data,
    locale,
  ]);

  if (!stats.length && !title) return null;

  return (
    <section className="relative z-10 -mt-10 px-4 pb-2 sm:-mt-14 lg:-mt-16 lg:px-8">
      <div className="relative container mx-auto overflow-hidden rounded-t-[2rem] bg-brand-forest-deep text-white shadow-[0_24px_60px_rgba(24,16,96,0.22)] sm:rounded-t-[2.75rem]">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(136,196,60,0.16),transparent_40%)]"
          aria-hidden="true"
        />
        <div className="relative px-6 py-12 sm:px-10 sm:py-14 lg:px-16 lg:py-16">
          <Reveal className="mb-10 text-center lg:mb-12">
            <p className="mb-4 flex items-center justify-center gap-4 text-xs font-bold uppercase tracking-[0.28em] text-brand-lime sm:text-sm">
              <span className="hidden h-px w-16 bg-brand-lime/50 sm:block" aria-hidden="true" />
              <span>{eyebrow}</span>
              <span className="hidden h-px w-16 bg-brand-lime/50 sm:block" aria-hidden="true" />
            </p>
            {title ? (
              <h2 className="mx-auto max-w-3xl text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl">
                {title}
              </h2>
            ) : null}
          </Reveal>

          {stats.length ? (
            <div className="mx-auto grid max-w-5xl grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4 md:gap-8">
              {stats.map((item, index) => (
                <motion.div
                  key={item.label}
                  className="text-center"
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.28, ease: easeOut, delay: index * 0.04 }}
                >
                  <StatValue
                    value={item.value}
                    className="mb-2 text-4xl font-extrabold tracking-tight text-white sm:text-5xl"
                  />
                  <p className="text-sm leading-7 text-white/70 sm:text-base">{item.label}</p>
                </motion.div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
