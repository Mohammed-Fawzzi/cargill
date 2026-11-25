import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import SafeImage from "@/components/ui/SafeImage";
import AccentHeading from "@/components/ui/AccentHeading";
import DragRail from "@/components/ui/DragRail";
import { useLocale } from "@/context/LocaleContext";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";
import { easeOut } from "@/lib/motion";
import useMotionPrefs from "@/hooks/useMotionPrefs";

const MAX_CARDS = 6;

function stripHtml(value) {
  return String(value || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function readingMinutes(text) {
  const words = stripHtml(text).split(/\s+/).filter(Boolean).length;
  if (words < 40) return 0;
  return Math.max(1, Math.round(words / 200));
}

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

function FieldNoteCard({ item, locale, index, reducedMotion }) {
  const title = t(item.title, locale);
  const excerpt = t(item.excerpt, locale);
  const content = t(item.content, locale);
  const category = t(item.category, locale);
  const dateLabel = formatArticleDate(item.createdAt, locale);
  const minutes = readingMinutes(`${excerpt} ${content}`);
  const minutesLabel =
    minutes > 0 ? `${minutes} ${t(UI.readingMinutes, locale)}` : "";
  const number = `${String(index + 1).padStart(2, "0")}.`;
  const mediaH = "12rem";

  return (
    <motion.article
      className="w-[min(78vw,20rem)] shrink-0 snap-start md:w-[22rem]"
      initial={reducedMotion ? false : { opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.45,
        delay: reducedMotion ? 0 : index * 0.08,
        ease: easeOut,
      }}
    >
      <Link
        to={`/articles/${item.id}`}
        className="ix-card group text-white"
        style={{ "--ix-media-h": mediaH }}
      >
        <div
          className="ix-card__media bg-[#110E33]"
          style={{ height: mediaH }}
        >
          {item.imageUrl ? (
            <SafeImage
              src={item.imageUrl}
              alt={title}
              width={720}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-[#0A0820]" />
          )}
          {category ? (
            <span className="absolute end-3 top-3 rounded-full border border-white/8 bg-[#0A0820]/85 px-2.5 py-0.5 text-[11px] text-brand-lime backdrop-blur-sm">
              {category}
            </span>
          ) : null}
        </div>

        {dateLabel || minutesLabel ? (
          <p className="mt-3 font-mono text-xs text-white/45">
            {[dateLabel, minutesLabel].filter(Boolean).join(" · ")}
          </p>
        ) : null}

        <div className="ix-card__title-row">
          <span className="ix-card__num" dir="ltr">
            {number}
          </span>
          <h3 className="ix-card__title font-display text-lg font-bold text-white transition-colors group-hover:text-brand-lime">
            {title}
          </h3>
        </div>

        {excerpt ? (
          <p className="ix-card__desc line-clamp-3 text-xs leading-relaxed text-white/60">
            {excerpt}
          </p>
        ) : null}

        <span className="ix-link mt-3 text-xs font-semibold text-brand-lime">
          {t(UI.readFieldGuide, locale)}
        </span>
      </Link>
    </motion.article>
  );
}

export default function ArticlesSection({ section }) {
  const { locale } = useLocale();
  const { reducedMotion } = useMotionPrefs();

  const items = useMemo(
    () => (section?.items || []).filter(Boolean).slice(0, MAX_CARDS),
    [section?.items],
  );

  const heading =
    t(section?.data?.title, locale) || t(UI.knowledgeTitle, locale);
  const body = t(section?.data?.body, locale) || t(UI.knowledgeBody, locale);

  if (!items.length) return null;

  return (
    <motion.section
      className="relative bg-[#0A0820] py-20 md:py-24"
      initial={reducedMotion ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.5, ease: easeOut }}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-12 flex flex-col justify-between gap-4 md:mb-14 md:flex-row md:items-end">
          <div>
            <p className="mb-2 text-xs font-medium tracking-wide text-brand-lime">
              {t(UI.nav.articles, locale)}
            </p>
            <AccentHeading
              as="h2"
              text={heading}
              className="font-display text-3xl font-bold text-white md:text-4xl"
            />
          </div>
          <div className="flex flex-col items-start gap-3 md:items-end">
            {body ? (
              <p className="max-w-md text-sm text-white/55 md:text-end">{body}</p>
            ) : null}
            <Link to="/articles" className="ix-link text-sm text-white">
              {t(UI.allMedia, locale)}
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <DragRail>
          {items.map((item, index) => (
            <FieldNoteCard
              key={item.id}
              item={item}
              locale={locale}
              index={index}
              reducedMotion={reducedMotion}
            />
          ))}
        </DragRail>
      </div>
    </motion.section>
  );
}
