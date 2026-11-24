import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Reveal from "@/components/ui/Reveal";
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

  const eyebrow =
    eyebrowProp ||
    t(contact?.companyName, locale) ||
    t(footer?.title, locale) ||
    t(UI.nav.about, locale);
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
      { value: String(products), label: t(UI.nav.products, locale) },
      { value: String(categories), label: t(UI.allCategories, locale) },
      { value: String(articles), label: t(UI.nav.articles, locale) },
      { value: String(events), label: t(UI.nav.events, locale) },
    ].filter((item) => Number(item.value) > 0);
  }, [
    productsQuery.data,
    categoriesQuery.data,
    articlesQuery.data,
    eventsQuery.data,
    locale,
  ]);

  if (!stats.length && !title) return null;

  return (
    <section className="relative overflow-hidden bg-brand-forest-deep py-16 text-white lg:py-20">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_40%,rgba(136,196,60,0.18),transparent_35%),radial-gradient(circle_at_85%_60%,rgba(255,255,255,0.06),transparent_40%)]"
        aria-hidden="true"
      />
      <div className="relative container mx-auto px-4 lg:px-8">
        <Reveal className="mb-10 max-w-2xl">
          {eyebrow ? (
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-brand-lime">
              {eyebrow}
            </p>
          ) : null}
          {title ? (
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-[2.75rem]">
              {title}
            </h2>
          ) : null}
        </Reveal>

        {stats.length ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {stats.map((item, index) => (
              <motion.div
                key={item.label}
                className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm sm:p-6"
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.3, ease: easeOut, delay: index * 0.04 }}
              >
                <p className="mb-2 text-3xl font-extrabold text-brand-lime sm:text-4xl">
                  {item.value}
                </p>
                <p className="text-sm leading-7 text-white/75 sm:text-base">
                  {item.label}
                </p>
              </motion.div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
