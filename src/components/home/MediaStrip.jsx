import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import SafeImage from "@/components/ui/SafeImage";
import SectionRule from "@/components/ui/SectionRule";
import { useLocale } from "@/context/LocaleContext";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";
import { formatMillis } from "@/lib/time";
import { easeOut } from "@/lib/motion";

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  return reduced;
}

export default function MediaStrip({ items = [] }) {
  const { locale } = useLocale();
  const reducedMotion = usePrefersReducedMotion();
  const rows = items.slice(0, 4);
  if (!rows.length) return null;

  return (
    <section className="bg-page py-[4.5rem] lg:py-[7.5rem]">
      <motion.div
        className="container mx-auto px-4 lg:px-8"
        initial={reducedMotion ? false : { opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.12 }}
        transition={{ duration: 0.35, ease: easeOut }}
      >
        <SectionRule
          label={t(UI.mediaReleases, locale)}
          number="06"
          labelClassName="text-ink"
          numberClassName="text-ink/55"
          lineClassName="bg-brand-navy"
        />

        <div className="mb-10 flex flex-col gap-4 sm:mb-12 lg:flex-row lg:items-end lg:justify-between">
          <h2 className="text-clip-safe text-3xl font-extrabold tracking-tight text-ink sm:text-4xl lg:text-[2.75rem]">
            {t(UI.mediaReleases, locale)}
          </h2>
          <Link
            to="/articles"
            className="inline-flex w-fit items-center gap-2 border-b-2 border-brand-lime pb-0.5 text-sm font-bold text-ink transition-[border-width] hover:border-b-[3px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime focus-visible:ring-offset-2"
          >
            <span>{t(UI.allNews, locale)}</span>
            <span aria-hidden="true">←</span>
          </Link>
        </div>

        <div>
          {rows.map((item) => {
            const title = t(item.title, locale);
            const date = formatMillis(item.createdAt, locale);
            const category = t(UI.nav.articles, locale);

            return (
              <Link
                key={item.id}
                to={`/articles/${item.id}`}
                className="group relative grid grid-cols-[5.5rem_1fr] items-center gap-3 border-b border-line/15 py-5 sm:grid-cols-[6.5rem_1fr] sm:gap-5 lg:grid-cols-[7.5rem_7rem_9rem_1fr_auto] lg:gap-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime"
              >
                <span
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-px origin-right scale-x-0 bg-brand-lime transition-transform duration-300 group-hover:scale-x-100"
                  aria-hidden="true"
                />

                <div className="order-1 overflow-hidden rounded-md bg-surface-muted sm:order-none">
                  {item.imageUrl ? (
                    <SafeImage
                      src={item.imageUrl}
                      alt={title}
                      width={240}
                      loading="lazy"
                      className="aspect-[4/3] h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div className="flex aspect-[4/3] items-center justify-center bg-surface-muted px-2 text-center text-xs font-bold text-ink/40">
                      {category}
                    </div>
                  )}
                </div>

                <div className="order-2 min-w-0 lg:contents">
                  <p className="mb-1 text-[11px] font-bold tracking-[0.14em] text-brand-lime lg:mb-0">
                    {category}
                  </p>
                  <p className="mb-1 hidden text-sm text-text-muted lg:mb-0 lg:block">
                    {date || "—"}
                  </p>
                  <h3 className="text-lg font-extrabold leading-7 text-ink transition-transform duration-300 ltr:group-hover:translate-x-2 rtl:group-hover:-translate-x-2 sm:text-[1.375rem]">
                    {title}
                  </h3>
                  <p className="mt-1 text-xs text-text-muted lg:hidden">
                    {date || "—"}
                  </p>
                </div>

                <span className="col-span-2 hidden text-sm font-bold text-ink lg:col-span-1 lg:inline-flex lg:justify-self-end">
                  {t(UI.findOutMore, locale)} ←
                </span>
              </Link>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}
