import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Reveal from "@/components/ui/Reveal";
import MagneticButton from "@/components/ui/MagneticButton";
import { useQuery } from "@tanstack/react-query";
import { useLocale } from "@/context/LocaleContext";
import { useSiteData } from "@/context/SiteDataContext";
import { getCategories, getProducts } from "@/services/cms/products";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";
import { easeOut } from "@/lib/motion";

export default function WhyCargill() {
  const { locale } = useLocale();
  const { contact } = useSiteData();
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

  const brand = t(contact?.companyName, locale) || "Cargill";
  const productCount = productsQuery.data?.length || 0;
  const categoryCount = categoriesQuery.data?.length || 0;

  const points = useMemo(
    () => [
      {
        id: "quality",
        title: t(UI.whyQualityTitle, locale),
        body: t(UI.whyQualityBody, locale),
        accent: "from-brand-lime/25 via-transparent to-transparent",
      },
      {
        id: "range",
        title: t(UI.whyRangeTitle, locale),
        body:
          productCount > 0
            ? t(UI.whyRangeBodyCount, locale).replace("{count}", String(productCount))
            : t(UI.whyRangeBody, locale),
        accent: "from-brand-moss/20 via-transparent to-transparent",
      },
      {
        id: "field",
        title: t(UI.whyFieldTitle, locale),
        body:
          categoryCount > 0
            ? t(UI.whyFieldBodyCount, locale).replace("{count}", String(categoryCount))
            : t(UI.whyFieldBody, locale),
        accent: "from-white/10 via-transparent to-transparent",
      },
    ],
    [locale, productCount, categoryCount],
  );

  return (
    <section className="relative overflow-hidden bg-brand-forest-deep py-16 text-white lg:py-24">
      <div
        className="pointer-events-none absolute -start-20 top-16 h-72 w-72 rounded-full bg-brand-lime/25 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -end-24 bottom-10 h-80 w-80 rounded-full bg-brand-moss/20 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative container mx-auto px-4 lg:px-8">
        <Reveal className="mx-auto mb-12 max-w-3xl text-center lg:mb-16">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-brand-lime">
            {t(UI.whyEyebrow, locale)}
          </p>
          <h2 className="mb-4 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-[2.75rem]">
            {t(UI.whyTitle, locale).replace("{brand}", brand)}
          </h2>
          <p className="text-sm leading-8 text-white/70 sm:text-base">
            {t(UI.whyBody, locale)}
          </p>
        </Reveal>

        <div className="grid gap-5 md:grid-cols-3 md:gap-6">
          {points.map((point, index) => (
            <motion.article
              key={point.id}
              className="group relative flex h-full min-h-[280px] flex-col overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/5 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.28)] backdrop-blur-sm transition-transform duration-200 ease-out hover:-translate-y-1.5 sm:p-7"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.3, ease: easeOut, delay: index * 0.06 }}
            >
              <div
                className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${point.accent}`}
                aria-hidden="true"
              />
              <p className="relative mb-6 text-6xl font-extrabold leading-none text-brand-lime/90 sm:text-7xl">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="relative mb-3 text-xl font-extrabold leading-8 sm:text-2xl">
                {point.title}
              </h3>
              <p className="relative mt-auto text-sm leading-8 text-white/70">{point.body}</p>
              <div
                className="absolute inset-x-0 bottom-0 h-1 origin-start scale-x-0 bg-brand-lime transition-transform duration-300 group-hover:scale-x-100"
                aria-hidden="true"
              />
            </motion.article>
          ))}
        </div>

        <Reveal delay={0.1} className="mt-12 flex justify-center">
          <MagneticButton>
            <Link
              to="/products"
              className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-md bg-brand-lime px-8 text-sm font-extrabold text-brand-ink transition-colors hover:bg-brand-lime-hover"
            >
              {t(UI.exploreProducts, locale)}
            </Link>
          </MagneticButton>
        </Reveal>
      </div>
    </section>
  );
}
