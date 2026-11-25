import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import SafeImage from "@/components/ui/SafeImage";
import { useLocale } from "@/context/LocaleContext";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";
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

function formatArticleDate(value, locale) {
  if (!value) return "";
  try {
    return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(value));
  } catch {
    return "";
  }
}

function readingMinutesFromText(text) {
  const words = String(text || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  if (words < 40) return 0;
  return Math.max(1, Math.round(words / 200));
}

function ArticleRailCard({ item, locale, featured }) {
  const title = t(item.title, locale);
  const excerpt = t(item.excerpt, locale);
  const content = t(item.content, locale);
  const dateLabel = formatArticleDate(item.createdAt, locale);
  const minutes = readingMinutesFromText(content || excerpt);

  return (
    <article
      className={`group relative w-[80vw] shrink-0 snap-start md:w-[380px] ${
        featured ? "md:w-[560px]" : ""
      }`}
    >
      <Link
        to={`/articles/${item.id}`}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime focus-visible:ring-offset-2 focus-visible:ring-offset-brand-forest-deep"
      >
        <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-md bg-brand-ink">
          {item.imageUrl ? (
            <SafeImage
              src={item.imageUrl}
              alt={title}
              width={featured ? 900 : 640}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex h-full items-center justify-center px-4 text-center text-sm font-bold text-white/40">
              {title}
            </div>
          )}
        </div>

        <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-bold tracking-wide">
          <span className="text-brand-lime">{t(UI.nav.articles, locale)}</span>
          {dateLabel ? (
            <>
              <span className="text-white/35" aria-hidden="true">
                ·
              </span>
              <span className="font-medium text-white/50">{dateLabel}</span>
            </>
          ) : null}
          {minutes > 0 ? (
            <>
              <span className="text-white/35" aria-hidden="true">
                ·
              </span>
              <span className="font-medium text-white/50">
                {minutes} {locale === "ar" ? "د" : "min"}
              </span>
            </>
          ) : null}
        </div>

        <h3
          className={`mb-2 line-clamp-3 font-extrabold leading-snug tracking-tight text-white ${
            featured ? "text-[1.4rem] sm:text-[1.625rem]" : "text-[1.25rem] sm:text-[1.375rem]"
          }`}
        >
          {title}
        </h3>

        {featured && excerpt ? (
          <p className="mb-4 line-clamp-2 text-sm leading-7 text-white/70">
            {excerpt}
          </p>
        ) : (
          <div className="mb-4" />
        )}

        <span
          className="block h-px w-full origin-right bg-white/15 transition-colors duration-300 group-hover:bg-brand-lime"
          aria-hidden="true"
        />
      </Link>
    </article>
  );
}

export default function KnowledgeHub({ items = [], section }) {
  const { locale } = useLocale();
  const reducedMotion = usePrefersReducedMotion();
  const railRef = useRef(null);
  const dragRef = useRef({ active: false, startX: 0, scroll: 0 });
  const [progress, setProgress] = useState(0);

  const cards = useMemo(() => (items || []).filter(Boolean), [items]);
  const dashboardTitle = t(section?.data?.title, locale);
  const dashboardBody = t(section?.data?.body, locale);
  const heading = dashboardTitle || t(UI.knowledgeBody, locale);
  const subtitle = dashboardTitle ? dashboardBody : "";

  const updateProgress = useCallback(() => {
    const node = railRef.current;
    if (!node) return;
    const max = node.scrollWidth - node.clientWidth;
    if (max <= 0) {
      setProgress(1);
      return;
    }
    setProgress(Math.min(1, Math.abs(node.scrollLeft) / max));
  }, []);

  useEffect(() => {
    const node = railRef.current;
    if (!node) return undefined;
    updateProgress();
    node.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    return () => {
      node.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, [cards.length, updateProgress]);

  const scrollByCard = (direction) => {
    const node = railRef.current;
    if (!node) return;
    const amount = Math.min(420, node.clientWidth * 0.75) * direction;
    node.scrollBy({
      left: amount,
      behavior: reducedMotion ? "auto" : "smooth",
    });
  };

  const onPointerDown = (event) => {
    if (event.pointerType === "touch") return;
    const node = railRef.current;
    if (!node) return;
    dragRef.current = {
      active: true,
      startX: event.clientX,
      scroll: node.scrollLeft,
    };
    node.setPointerCapture?.(event.pointerId);
  };

  const onPointerMove = (event) => {
    if (!dragRef.current.active) return;
    const node = railRef.current;
    if (!node) return;
    const delta = event.clientX - dragRef.current.startX;
    node.scrollLeft = dragRef.current.scroll - delta;
  };

  const onPointerUp = (event) => {
    if (!dragRef.current.active) return;
    dragRef.current.active = false;
    railRef.current?.releasePointerCapture?.(event.pointerId);
  };

  if (!cards.length) return null;

  const useSimpleGrid = cards.length < 2;

  return (
    <section className="bg-brand-forest-deep py-[4.5rem] text-white sm:py-24 lg:py-[7.5rem]">
      <motion.div
        className="container mx-auto px-4 lg:px-8"
        initial={reducedMotion ? false : { opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.12 }}
        transition={{ duration: 0.35, ease: easeOut }}
      >
        <div className="mb-6 flex items-center gap-4">
          <p className="shrink-0 text-[11px] font-bold tracking-[0.18em] text-brand-lime">
            {t(UI.knowledgeTitle, locale)}
          </p>
          <span className="h-px flex-1 bg-white/20" aria-hidden="true" />
          <p className="shrink-0 text-[11px] font-bold tracking-[0.2em] text-white/45">
            05
          </p>
        </div>

        <div className="mb-10 flex flex-col gap-5 lg:mb-14 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-[2.75rem]">
              {heading}
            </h2>
            {subtitle ? (
              <p className="mt-3 text-sm leading-7 text-white/70 sm:text-base sm:leading-8">
                {subtitle}
              </p>
            ) : null}
          </div>

          <div className="hidden items-center gap-4 md:flex">
            {!useSimpleGrid ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => scrollByCard(1)}
                  aria-label={t(UI.prevSlide, locale)}
                  className="inline-flex h-10 w-10 items-center justify-center border border-white/40 text-white transition-colors hover:border-brand-lime hover:text-brand-lime focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime"
                >
                  <IoChevronForward className="text-lg rtl:rotate-180" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollByCard(-1)}
                  aria-label={t(UI.nextSlide, locale)}
                  className="inline-flex h-10 w-10 items-center justify-center border border-white/40 text-white transition-colors hover:border-brand-lime hover:text-brand-lime focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime"
                >
                  <IoChevronBack className="text-lg rtl:rotate-180" aria-hidden="true" />
                </button>
              </div>
            ) : null}
            <Link
              to="/articles"
              className="inline-flex items-center gap-2 border-b-2 border-brand-lime pb-0.5 text-sm font-bold text-white transition-[border-width] hover:border-b-[3px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime"
            >
              <span>{t(UI.allMedia, locale)}</span>
              <span aria-hidden="true">←</span>
            </Link>
          </div>
        </div>
      </motion.div>

      {useSimpleGrid ? (
        <div className="container mx-auto grid grid-cols-1 gap-6 px-4 sm:grid-cols-2 lg:px-8">
          {cards.map((item, index) => (
            <ArticleRailCard
              key={item.id}
              item={item}
              locale={locale}
              featured={index === 0}
            />
          ))}
        </div>
      ) : (
        <>
          <div
            ref={railRef}
            className="flex cursor-grab gap-4 overflow-x-auto px-4 pb-2 active:cursor-grabbing lg:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            {cards.map((item, index) => (
              <ArticleRailCard
                key={item.id}
                item={item}
                locale={locale}
                featured={index === 0}
              />
            ))}
            <div className="w-[12vw] shrink-0 md:w-[18vw]" aria-hidden="true" />
          </div>

          <div className="container mx-auto mt-8 px-4 lg:px-8">
            <div className="relative h-px w-full bg-white/20">
              <span
                className="absolute inset-y-0 start-0 bg-brand-lime"
                style={{
                  width: `${Math.max(8, Math.min(100, Math.abs(progress) * 100))}%`,
                }}
                aria-hidden="true"
              />
            </div>

            <div className="mt-6 md:hidden">
              <Link
                to="/articles"
                className="inline-flex items-center gap-2 border-b-2 border-brand-lime pb-0.5 text-sm font-bold text-white"
              >
                <span>{t(UI.allMedia, locale)}</span>
                <span aria-hidden="true">←</span>
              </Link>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
