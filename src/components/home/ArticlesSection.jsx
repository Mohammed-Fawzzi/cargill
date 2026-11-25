import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import CurtainCard from "@/components/ui/CurtainCard";
import DragRail from "@/components/ui/DragRail";
import SectionIntro from "@/components/ui/SectionIntro";
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
  const label = [category, dateLabel, minutesLabel].filter(Boolean).join(" / ");

  return (
    <motion.article
      className="w-[min(78vw,20rem)] shrink-0 snap-start self-start md:w-[22rem]"
      initial={reducedMotion ? false : { opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.45,
        delay: reducedMotion ? 0 : index * 0.08,
        ease: easeOut,
      }}
    >
      <CurtainCard
        to={`/articles/${item.id}`}
        imageUrl={item.imageUrl}
        imageAlt={title}
        label={label}
        title={title}
        description={excerpt}
        className="h-full rounded-xl"
      >
        <span className="mt-4 text-xs font-semibold text-brand-lime">
          {t(UI.readFieldGuide, locale)}
        </span>
      </CurtainCard>
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
      data-home-bg="#0A0820"
      className="relative bg-transparent py-20 md:py-24"
      initial={reducedMotion ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.5, ease: easeOut }}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionIntro
          className="md:mb-14"
          label={t(UI.nav.articles, locale)}
          title={heading}
          body={body}
          action={
            <Link to="/articles" className="ix-link text-sm text-white">
              {t(UI.allMedia, locale)}
            </Link>
          }
        />

        <DragRail dots>
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
