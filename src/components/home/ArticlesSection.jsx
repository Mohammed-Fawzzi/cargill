import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Reveal from "@/components/ui/Reveal";
import SafeImage from "@/components/ui/SafeImage";
import MagneticButton from "@/components/ui/MagneticButton";
import { EmptyState } from "@/components/ui/StatusMessage";
import { useLocale } from "@/context/LocaleContext";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";
import { easeOut } from "@/lib/motion";

export default function ArticlesSection({ section }) {
  const { locale } = useLocale();
  const items = (section?.items || []).slice(0, 3);
  const title = t(section?.data?.title, locale);
  const body = t(section?.data?.body, locale);
  const featured = items[0];
  const sideItems = items.slice(1);

  return (
    <section className="relative overflow-hidden bg-white py-16 lg:py-24">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-ink/10 to-transparent"
        aria-hidden="true"
      />
      <div className="container mx-auto px-4 lg:px-8">
        <Reveal className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end lg:mb-14">
          <div className="max-w-2xl">
            {title ? (
              <h2 className="mb-3 text-3xl font-extrabold tracking-tight text-brand-ink sm:text-4xl lg:text-[2.75rem]">
                {title}
              </h2>
            ) : null}
            {body ? (
              <p className="text-sm leading-8 text-text-muted sm:text-base">{body}</p>
            ) : null}
          </div>
          <MagneticButton>
            <Link
              to="/articles"
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-brand-ink/15 px-6 text-sm font-bold text-brand-ink transition-all duration-300 hover:border-brand-lime hover:bg-brand-lime"
            >
              {t(UI.viewAll, locale)}
            </Link>
          </MagneticButton>
        </Reveal>

        {items.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.35fr_0.9fr] lg:gap-7">
            {featured ? (
              <motion.article
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, ease: easeOut }}
                className="group relative min-h-[420px] overflow-hidden rounded-[1.75rem] bg-brand-forest-deep shadow-[0_20px_50px_rgba(24,16,96,0.14)]"
              >
                <Link to={`/articles/${featured.id}`} className="absolute inset-0 block">
                  <SafeImage
                    src={featured.imageUrl}
                    alt={t(featured.title, locale)}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-brand-forest-deep via-brand-forest-deep/45 to-transparent"
                    aria-hidden="true"
                  />
                  <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">
                    <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-brand-lime">
                      {t(UI.nav.articles, locale)}
                    </p>
                    <h3 className="mb-3 text-2xl font-extrabold leading-tight sm:text-3xl">
                      {t(featured.title, locale)}
                    </h3>
                    <p className="mb-4 line-clamp-2 max-w-xl text-sm leading-7 text-white/80">
                      {t(featured.excerpt, locale)}
                    </p>
                    <span className="text-sm font-bold text-brand-lime">
                      {t(UI.readMore, locale)} →
                    </span>
                  </div>
                </Link>
              </motion.article>
            ) : null}

            <div className="flex flex-col gap-5">
              {sideItems.map((item, index) => (
                <motion.article
                  key={item.id}
                  initial={{ opacity: 0, x: 24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ duration: 0.55, ease: easeOut, delay: 0.08 + index * 0.08 }}
                  className="group flex min-h-[190px] overflow-hidden rounded-[1.5rem] border border-brand-ink/8 bg-white shadow-[0_10px_30px_rgba(24,16,96,0.05)]"
                >
                  <Link to={`/articles/${item.id}`} className="flex w-full">
                    <div className="relative w-[42%] shrink-0 overflow-hidden bg-surface-muted">
                      <SafeImage
                        src={item.imageUrl}
                        alt={t(item.title, locale)}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="flex flex-1 flex-col justify-center p-5 sm:p-6">
                      <h3 className="mb-2 text-lg font-extrabold leading-7 text-brand-ink transition-colors group-hover:text-brand-lime">
                        {t(item.title, locale)}
                      </h3>
                      <p className="mb-3 line-clamp-2 text-sm leading-7 text-text-muted">
                        {t(item.excerpt, locale)}
                      </p>
                      <span className="text-sm font-bold text-brand-ink group-hover:text-brand-lime">
                        {t(UI.readMore, locale)}
                      </span>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
