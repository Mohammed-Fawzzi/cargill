import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Reveal from "@/components/ui/Reveal";
import { useLocale } from "@/context/LocaleContext";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";
import { easeOut } from "@/lib/motion";

export default function KnowledgeHub({ items = [] }) {
  const { locale } = useLocale();
  const cards = items.slice(0, 4);
  if (!cards.length) return null;

  return (
    <section className="relative overflow-hidden bg-surface-muted py-16 lg:py-20">
      <div className="container relative mx-auto px-4 lg:px-8">
        <Reveal className="mb-10 max-w-2xl lg:mb-12">
          <h2 className="mb-3 text-3xl font-extrabold tracking-tight text-brand-ink sm:text-4xl">
            {t(UI.knowledgeTitle, locale)}
          </h2>
          <p className="text-sm leading-8 text-text-muted sm:text-base">
            {t(UI.knowledgeBody, locale)}
          </p>
        </Reveal>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {cards.map((item, index) => {
            const title = t(item.title, locale);
            const excerpt = t(item.excerpt, locale);
            return (
              <motion.div
                key={item.id}
                className="h-full"
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.12 }}
                transition={{ duration: 0.28, ease: easeOut, delay: index * 0.04 }}
              >
                <Link
                  to={`/articles/${item.id}`}
                  className="group relative flex h-full cursor-pointer flex-col overflow-hidden border border-brand-ink/8 bg-white p-6 transition-transform duration-200 ease-out hover:-translate-y-1 hover:border-brand-lime/40 hover:shadow-[0_16px_40px_rgba(24,16,96,0.1)] sm:p-7"
                >
                  <div
                    className="absolute inset-x-0 top-0 h-1 origin-start scale-x-0 bg-brand-lime transition-transform duration-200 group-hover:scale-x-100"
                    aria-hidden="true"
                  />
                  <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-brand-moss">
                    {t(UI.nav.articles, locale)}
                  </p>
                  <h3 className="mb-3 text-xl font-extrabold leading-8 text-brand-ink transition-colors group-hover:text-brand-lime">
                    {title}
                  </h3>
                  {excerpt ? (
                    <p className="mb-5 line-clamp-2 flex-1 text-sm leading-7 text-text-muted">
                      {excerpt}
                    </p>
                  ) : (
                    <div className="mb-5 flex-1" />
                  )}
                  <span className="inline-flex items-center gap-2 text-sm font-bold text-brand-ink transition-all group-hover:gap-3 group-hover:text-brand-lime">
                    {t(UI.findOutMore, locale)}
                    <span aria-hidden="true">→</span>
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
