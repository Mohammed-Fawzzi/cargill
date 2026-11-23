import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import CtaLink from "@/components/ui/CtaLink";
import { useLocale } from "@/context/LocaleContext";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";

const AUTOPLAY_MS = 7000;

function isUsableSlide(slide, locale) {
  if (!slide) return false;
  const title = t(slide.title, locale);
  const body = t(slide.body, locale);
  const label = t(slide.cta?.label, locale);
  return Boolean(slide.imageUrl || title || body || (slide.cta?.href && label));
}

export default function HeroSection({ section }) {
  const { locale } = useLocale();
  const slides = useMemo(
    () => (section?.data?.slides || []).filter((slide) => isUsableSlide(slide, locale)),
    [section?.data?.slides, locale],
  );
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [imageFailed, setImageFailed] = useState({});
  const multi = slides.length > 1;

  useEffect(() => {
    setIndex(0);
  }, [slides.length]);

  useEffect(() => {
    if (!multi || paused) return undefined;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [multi, paused, slides.length, index]);

  if (!slides.length) return null;

  const safeIndex = index % slides.length;
  const slide = slides[safeIndex] || slides[0];
  const title = t(slide.title, locale);
  const body = t(slide.body, locale);
  const ctaLabel = t(slide.cta?.label, locale);
  const href = slide.cta?.href;
  const showImage = Boolean(slide.imageUrl) && !imageFailed[slide.id];

  const goTo = (nextIndex) => {
    setIndex(((nextIndex % slides.length) + slides.length) % slides.length);
  };

  return (
    <section
      className="relative min-h-[100svh] overflow-hidden bg-brand-black"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          {showImage ? (
            <img
              src={slide.imageUrl}
              alt={title || t(UI.heroImage, locale)}
              className="absolute inset-0 h-full w-full object-cover"
              onError={() =>
                setImageFailed((current) => ({ ...current, [slide.id]: true }))
              }
            />
          ) : (
            <div
              className="absolute inset-0 bg-gradient-to-br from-brand-forest via-brand-forest-deep to-brand-black"
              aria-hidden="true"
            />
          )}
        </motion.div>
      </AnimatePresence>

      <div
        className="absolute inset-0 bg-gradient-to-t from-brand-black/80 via-brand-black/40 to-brand-black/25"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-gradient-to-l from-brand-black/50 via-transparent to-brand-black/30"
        aria-hidden="true"
      />

      <div className="relative container mx-auto flex min-h-[100svh] items-center px-4 pb-28 pt-[calc(var(--navbar-height)+3rem)] lg:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${slide.id}-copy`}
            className="max-w-3xl text-white"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            {title ? (
              <h1 className="mb-5 text-4xl font-extrabold leading-[1.12] tracking-tight sm:text-5xl lg:text-6xl xl:text-[4.25rem]">
                {title}
              </h1>
            ) : null}
            {body ? (
              <p className="mb-8 max-w-xl text-base leading-8 text-white/85 sm:text-lg lg:text-xl lg:leading-9">
                {body}
              </p>
            ) : null}
            {href && ctaLabel ? (
              <CtaLink
                href={href}
                className="inline-flex min-h-12 items-center justify-center rounded-md bg-[#2a2a2a] px-8 py-3.5 text-sm font-bold text-white transition-all duration-300 hover:bg-brand-lime hover:text-brand-black"
              >
                {ctaLabel}
              </CtaLink>
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>

      {multi ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10">
          <div className="container mx-auto flex items-end justify-between gap-4 px-4 pb-7 lg:px-8 lg:pb-10">
            <div className="pointer-events-auto flex items-center gap-2.5">
              {slides.map((item, itemIndex) => {
                const active = itemIndex === safeIndex;
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-label={t(item.title, locale) || `slide ${itemIndex + 1}`}
                    aria-current={active ? "true" : undefined}
                    onClick={() => goTo(itemIndex)}
                    className={`inline-flex items-center justify-center rounded-full transition-all duration-300 ${
                      active
                        ? "h-4 w-4 border border-white"
                        : "h-2.5 w-2.5 bg-white/55 hover:bg-white"
                    }`}
                  >
                    {active ? (
                      <span className="h-1.5 w-1.5 rounded-full bg-white" aria-hidden="true" />
                    ) : null}
                  </button>
                );
              })}
            </div>

            <div className="pointer-events-auto flex items-center gap-3">
              <button
                type="button"
                onClick={() => goTo(safeIndex - 1)}
                aria-label={t(UI.prevSlide, locale)}
                className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/75 bg-transparent text-white transition-all duration-300 hover:bg-white/15"
              >
                <IoChevronBack className="text-xl rtl:rotate-180" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => goTo(safeIndex + 1)}
                aria-label={t(UI.nextSlide, locale)}
                className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/75 bg-transparent text-white transition-all duration-300 hover:bg-white/15"
              >
                <IoChevronForward className="text-xl rtl:rotate-180" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
