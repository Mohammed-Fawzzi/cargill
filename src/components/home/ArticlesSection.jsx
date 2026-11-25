import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import SafeImage from "@/components/ui/SafeImage";
import AccentHeading from "@/components/ui/AccentHeading";
import { useLocale } from "@/context/LocaleContext";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";
import { easeOut } from "@/lib/motion";
import useMotionPrefs from "@/hooks/useMotionPrefs";

function formatArticleDate(value, locale) {
  if (!value) return "";
  try {
    return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(value));
  } catch {
    return "";
  }
}

function ArticleCard({ item, locale, featured }) {
  const title = t(item.title, locale);
  const dateLabel = formatArticleDate(item.createdAt, locale);
  const meta = [t(UI.nav.articles, locale), dateLabel].filter(Boolean).join(" · ");

  return (
    <Link
      to={`/articles/${item.id}`}
      className={`group shrink-0 text-white ${
        featured ? "w-[min(78vw,520px)]" : "w-[min(72vw,380px)]"
      }`}
    >
      <div className="h-[280px] overflow-hidden rounded-[14px] border border-white/8 bg-[#110E33] sm:h-[420px]">
        {item.imageUrl ? (
          <SafeImage
            src={item.imageUrl}
            alt={title}
            width={featured ? 900 : 640}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : null}
      </div>
      {meta ? (
        <p className="mt-[18px] text-[13px] text-brand-lime">{meta}</p>
      ) : null}
      <h3
        className={`mt-2 font-display font-extrabold leading-tight transition-colors group-hover:text-brand-lime ${
          featured ? "text-[28px]" : "text-[24px]"
        }`}
      >
        {title}
      </h3>
    </Link>
  );
}

export default function ArticlesSection({ section }) {
  const { locale } = useLocale();
  const { reducedMotion } = useMotionPrefs();
  const [paused, setPaused] = useState(false);
  const items = useMemo(
    () => (section?.items || []).filter(Boolean).slice(0, 8),
    [section?.items],
  );
  const heading = t(section?.data?.title, locale) || t(UI.knowledgeTitle, locale);
  const loop = useMemo(() => {
    if (items.length < 2) return items;
    return [...items, ...items];
  }, [items]);

  if (!items.length) return null;

  return (
    <motion.section
      className="overflow-hidden bg-[#0A0820] py-[110px]"
      initial={reducedMotion ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.5, ease: easeOut }}
    >
      <div className="mx-auto max-w-[1320px] px-6">
        <div className="flex items-center gap-4 text-[14px] text-white/70">
          <span>{t(UI.knowledgeTitle, locale)}</span>
          <span className="h-px flex-1 bg-white/14" aria-hidden="true" />
          <span className="font-mono text-brand-lime" dir="ltr">
            § 04 — FIELD NOTES
          </span>
        </div>

        <div className="mt-[30px] flex flex-wrap items-end justify-between gap-6">
          <AccentHeading
            as="h2"
            text={heading}
            className="font-display text-[clamp(2.75rem,8vw,5.25rem)] font-black tracking-[-0.02em] text-white md:text-[84px]"
          />
          <Link
            to="/articles"
            className="border-b border-brand-lime pb-[3px] text-white transition-colors hover:text-brand-lime"
          >
            {t(UI.allMedia, locale)} ←
          </Link>
        </div>
      </div>

      <div
        className="mt-12"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {items.length < 2 || reducedMotion ? (
          <div className="mx-auto flex max-w-[1320px] gap-4 overflow-x-auto px-6 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {items.map((item, index) => (
              <ArticleCard
                key={item.id}
                item={item}
                locale={locale}
                featured={index === 0}
              />
            ))}
          </div>
        ) : (
          <div
            className={`flex w-max gap-4 pe-4 ps-6 ${
              paused
                ? ""
                : locale === "ar"
                  ? "animate-ticker-slow-rtl"
                  : "animate-ticker-slow"
            }`}
            style={{ willChange: "transform" }}
          >
            {loop.map((item, index) => (
              <ArticleCard
                key={`${item.id}-${index}`}
                item={item}
                locale={locale}
                featured={index % items.length === 0}
              />
            ))}
          </div>
        )}
      </div>
    </motion.section>
  );
}
