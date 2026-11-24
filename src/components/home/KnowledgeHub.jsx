import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Reveal from "@/components/ui/Reveal";
import SafeImage from "@/components/ui/SafeImage";
import MagneticButton from "@/components/ui/MagneticButton";
import { useLocale } from "@/context/LocaleContext";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";
import { easeOut } from "@/lib/motion";

export default function KnowledgeHub({ items = [] }) {
  const { locale } = useLocale();
  const cards = items.slice(0, 4);
  if (!cards.length) return null;

  const featured = cards[0];
  const side = cards.slice(1);
  const featuredTitle = t(featured.title, locale);
  const featuredExcerpt = t(featured.excerpt, locale);

  return (
    <section className="relative overflow-hidden bg-brand-forest-deep py-16 text-white lg:py-24">
      <div
        className="pointer-events-none absolute -start-24 top-10 h-72 w-72 rounded-full bg-brand-lime/20 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -end-16 bottom-0 h-80 w-80 rounded-full bg-brand-moss/20 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-lime/40 to-transparent"
        aria-hidden="true"
      />

      <div className="relative container mx-auto px-4 lg:px-8">
        <Reveal className="mb-10 flex flex-col items-start justify-between gap-5 lg:mb-14 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-brand-lime">
              {t(UI.nav.articles, locale)}
            </p>
            <h2 className="mb-3 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-[2.85rem]">
              {t(UI.knowledgeTitle, locale)}
            </h2>
            <p className="text-sm leading-8 text-white/70 sm:text-base">
              {t(UI.knowledgeBody, locale)}
            </p>
          </div>
          <MagneticButton>
            <Link
              to="/articles"
              className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-md border border-white/25 px-6 text-sm font-bold text-white transition-all duration-300 hover:border-brand-lime hover:bg-brand-lime hover:text-brand-ink"
            >
              {t(UI.viewAll, locale)}
            </Link>
          </MagneticButton>
        </Reveal>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.35fr_0.9fr] lg:gap-5">
          <motion.article
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.35, ease: easeOut }}
            className="group relative min-h-[420px] overflow-hidden rounded-[1.75rem] bg-brand-black shadow-[0_24px_60px_rgba(0,0,0,0.28)] sm:min-h-[520px]"
          >
            <Link to={`/articles/${featured.id}`} className="absolute inset-0 block cursor-pointer">
              {featured.imageUrl ? (
                <SafeImage
                  src={featured.imageUrl}
                  alt={featuredTitle}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-brand-moss to-brand-black" />
              )}
              <div
                className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-forest-deep/55 to-transparent"
                aria-hidden="true"
              />
              <div
                className="absolute inset-x-0 top-0 h-1 origin-start scale-x-0 bg-brand-lime transition-transform duration-500 group-hover:scale-x-100"
                aria-hidden="true"
              />
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 lg:p-10">
                <span className="mb-4 inline-flex rounded-full bg-brand-lime px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.16em] text-brand-ink">
                  {t(UI.featuredBadge, locale)}
                </span>
                <h3 className="mb-3 max-w-xl text-2xl font-extrabold leading-tight sm:text-3xl lg:text-4xl">
                  {featuredTitle}
                </h3>
                {featuredExcerpt ? (
                  <p className="mb-5 line-clamp-2 max-w-xl text-sm leading-7 text-white/75 sm:text-base">
                    {featuredExcerpt}
                  </p>
                ) : null}
                <span className="inline-flex items-center gap-2 text-sm font-extrabold text-brand-lime transition-all group-hover:gap-3">
                  {t(UI.findOutMore, locale)}
                  <span aria-hidden="true">→</span>
                </span>
              </div>
            </Link>
          </motion.article>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 lg:gap-5">
            {side.map((item, index) => {
              const title = t(item.title, locale);
              const excerpt = t(item.excerpt, locale);
              return (
                <motion.article
                  key={item.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.3, ease: easeOut, delay: 0.06 + index * 0.04 }}
                  className="group relative min-h-[180px] overflow-hidden rounded-[1.5rem] bg-brand-black shadow-[0_16px_40px_rgba(0,0,0,0.22)] lg:min-h-[160px]"
                >
                  <Link to={`/articles/${item.id}`} className="absolute inset-0 block cursor-pointer">
                    {item.imageUrl ? (
                      <SafeImage
                        src={item.imageUrl}
                        alt={title}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-brand-moss/80 to-brand-forest-deep" />
                    )}
                    <div
                      className="absolute inset-0 bg-gradient-to-t from-brand-black/90 via-brand-forest-deep/45 to-brand-black/10"
                      aria-hidden="true"
                    />
                    <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                      <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-brand-lime">
                        {t(UI.nav.articles, locale)}
                      </p>
                      <h3 className="mb-2 text-lg font-extrabold leading-7 sm:text-xl">
                        {title}
                      </h3>
                      {excerpt ? (
                        <p className="mb-3 line-clamp-2 text-sm leading-6 text-white/70">
                          {excerpt}
                        </p>
                      ) : null}
                      <span className="text-sm font-bold text-white transition-colors group-hover:text-brand-lime">
                        {t(UI.readMore, locale)} →
                      </span>
                    </div>
                  </Link>
                </motion.article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
