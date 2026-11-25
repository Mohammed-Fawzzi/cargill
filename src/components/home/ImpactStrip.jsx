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
    <section className="relative z-0 mt-0 isolate border-y border-line/10 bg-surface px-4 py-12 lg:px-8 lg:py-16">
      <div className="relative container mx-auto">
        <div
          className="pointer-events-none absolute start-[10%] top-0 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(136,196,60,0.08),transparent_70%)] blur-2xl"
          aria-hidden="true"
        />
        <div className="relative">
          <Reveal className="mb-10 text-center lg:mb-12">
            <p className="mb-4 flex items-center justify-center gap-4 font-mono text-[10px] font-medium uppercase tracking-[0.28em] text-brand-lime sm:text-[11px]">
              <span className="hidden h-px w-16 bg-brand-lime/50 sm:block" aria-hidden="true" />
              <span className="text-clip-safe">{eyebrow}</span>
              <span className="hidden h-px w-16 bg-brand-lime/50 sm:block" aria-hidden="true" />
            </p>
            {title ? (
              <h2 className="mx-auto max-w-3xl text-xl font-extrabold tracking-tight text-ink line-clamp-4 sm:text-3xl sm:line-clamp-none lg:text-4xl">
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
                    className="mb-2 text-4xl font-extrabold tracking-tight text-ink sm:text-5xl"
                  />
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink/55 sm:text-[11px]">
                    {item.label}
                  </p>
                </motion.div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
