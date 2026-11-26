import React, { useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import SafeMedia from "@/components/ui/SafeMedia";
import ParallaxImage from "@/components/ui/ParallaxImage";
import SectionIntro from "@/components/ui/SectionIntro";
import { SplitBtnLabel } from "@/components/ui/SplitArrowButton";
import { useLocale } from "@/context/LocaleContext";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";
import { easeOut } from "@/lib/motion";
import useMotionPrefs from "@/hooks/useMotionPrefs";

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

function FieldCard({ item, locale, large, index, reducedMotion }) {
  const labelRef = useRef(null);
  const title = t(item.title, locale);
  const excerpt = t(item.excerpt, locale);
  const content = t(item.content, locale);
  const category = t(item.category, locale);
  const dateLabel = formatArticleDate(item.createdAt, locale);
  const minutes = readingMinutes(`${excerpt} ${content}`);
  const minutesLabel =
    minutes > 0 ? `${minutes} ${t(UI.readingMinutes, locale)}` : "";
  const label = [category, dateLabel, minutesLabel].filter(Boolean).join(" / ");
  const meta = large ? label : dateLabel;
  const showExcerpt = large && excerpt;
  const shellClass = large
    ? "group flex h-full min-h-[26rem] flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-[#110E33] lg:min-h-[34rem]"
    : "group flex h-full min-h-40 overflow-hidden rounded-2xl border border-white/[0.06] bg-[#110E33]";
  const frameClass = large
    ? "curtain-frame relative min-h-[14rem] flex-1"
    : "curtain-frame relative w-[42%] shrink-0";
  const titleClass = large
    ? "font-display text-2xl font-bold leading-snug text-white md:text-[2rem]"
    : "font-display text-lg font-bold leading-snug text-white";

  return (
    <motion.div
      className="h-full"
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
        className={shellClass}
        onPointerEnter={(event) => {
          if (event.pointerType === "mouse" || event.pointerType === "pen") {
            labelRef.current?.play();
          }
        }}
      >
        <div className={frameClass}>
          {item.imageUrl || item.videoUrl ? (
            <SafeMedia
              src={item.imageUrl}
              videoUrl={item.videoUrl || ""}
              alt={title}
              width={large ? 1200 : 640}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-[#0A0820]" />
          )}
          {item.imageUrl || item.videoUrl ? (
            <div className="curtain-card__cover">
              {item.videoUrl ? (
                <SafeMedia
                  src={item.imageUrl}
                  videoUrl={item.videoUrl || ""}
                  alt=""
                  width={large ? 1200 : 640}
                  className="curtain-card__photo"
                />
              ) : (
                <ParallaxImage
                  src={item.imageUrl}
                  alt=""
                  width={large ? 1200 : 640}
                  className="curtain-card__photo"
                />
              )}
              <div className="curtain-card__shade" />
            </div>
          ) : null}
          <span className="cover-cta" aria-hidden="true">
            <span className="cover-cta__ring">
              <span className="cover-cta__glyph">←</span>
              <span className="cover-cta__glyph">←</span>
            </span>
          </span>
        </div>
        <div className={large ? "p-6 md:p-8" : "flex min-w-0 flex-1 flex-col justify-end p-4"}>
          {meta ? (
            <p className="mb-2 text-xs text-white/55">{meta}</p>
          ) : null}
          <h3 className={titleClass}>{title}</h3>
          {showExcerpt ? (
            <p className="curtain-card__desc text-sm leading-relaxed">
              {excerpt}
            </p>
          ) : null}
          <span className="split-btn split-btn--primary pointer-events-none mt-4 min-h-10">
            <SplitBtnLabel ref={labelRef}>
              {t(UI.readFieldGuide, locale)}
            </SplitBtnLabel>
            <span className="split-btn__arrow" aria-hidden="true">
              <span className="split-btn__icon">←</span>
            </span>
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

export default function ArticlesSection({ section }) {
  const { locale } = useLocale();
  const { reducedMotion } = useMotionPrefs();

  const items = useMemo(
    () => (section?.items || []).filter(Boolean).slice(0, 3),
    [section?.items],
  );

  const heading =
    t(section?.data?.title, locale) || t(UI.knowledgeTitle, locale);
  const body = t(section?.data?.body, locale) || t(UI.knowledgeBody, locale);
  const [lead, ...rest] = items;

  if (!lead) return null;

  return (
    <motion.section
      data-home-bg="#0A0820"
      className="relative bg-transparent py-20 md:py-24"
      initial={reducedMotion ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.5, ease: easeOut }}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionIntro
          className="md:mb-10"
          label={t(UI.nav.articles, locale)}
          title={heading}
          body={body}
          action={
            <Link to="/articles" className="ix-link text-sm text-white">
              {t(UI.allMedia, locale)}
            </Link>
          }
        />

        <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-[1.45fr_1fr]">
          <FieldCard
            item={lead}
            locale={locale}
            large
            index={0}
            reducedMotion={reducedMotion}
          />
          {rest.length ? (
            <div className="grid gap-4">
              {rest.map((item, index) => (
                <FieldCard
                  key={item.id}
                  item={item}
                  locale={locale}
                  index={index + 1}
                  reducedMotion={reducedMotion}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </motion.section>
  );
}
