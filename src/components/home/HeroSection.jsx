import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import CtaLink from "@/components/ui/CtaLink";
import SafeImage from "@/components/ui/SafeImage";
import MagneticButton from "@/components/ui/MagneticButton";
import OrganicFloat from "@/components/ui/OrganicFloat";
import { useLocale } from "@/context/LocaleContext";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";
import { easeOut } from "@/lib/motion";

const AUTOPLAY_MS = 4500;

function isUsableSlide(slide, locale) {
  if (!slide) return false;
  const title = t(slide.title, locale);
  const body = t(slide.body, locale);
  const label = t(slide.cta?.label, locale);
  return Boolean(slide.imageUrl || title || body || (slide.cta?.href && label));
}

function AnimatedTitle({ text }) {
  const words = String(text || "").split(/\s+/).filter(Boolean);
  return (
    <h1 className="mb-6 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl xl:text-[4.6rem]">
      {words.map((word, index) => (
        <motion.span
          key={`${word}-${index}`}
          className="inline-block"
          initial={{ opacity: 0, y: 42, rotateX: 40 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 0.55, ease: easeOut, delay: 0.08 + index * 0.06 }}
          style={{ transformOrigin: "bottom" }}
        >
          {word}
          {index < words.length - 1 ? "\u00A0" : ""}
        </motion.span>
      ))}
    </h1>
  );
}

export default function HeroSection({ section }) {
  const { locale } = useLocale();
  const slides = useMemo(
    () => (section?.data?.slides || []).filter((slide) => isUsableSlide(slide, locale)),
    [section?.data?.slides, locale],
  );
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const multi = slides.length > 1;
  const { scrollY } = useScroll();
  const imageY = useTransform(scrollY, [0, 500], [0, 90]);
  const contentY = useTransform(scrollY, [0, 400], [0, 40]);

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

  const goTo = (nextIndex) => {
    setIndex(((nextIndex % slides.length) + slides.length) % slides.length);
  };

  return (
    <section
      className="relative min-h-[100svh] overflow-hidden bg-brand-forest-deep"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <AnimatePresence initial={false}>
        <motion.div
          key={slide.id}
          className="absolute inset-0"
          style={{ y: imageY }}
          initial={{ opacity: 0, scale: 1.14 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.5, ease: easeOut }}
        >
          {slide.imageUrl ? (
            <SafeImage
              src={slide.imageUrl}
              alt={title || t(UI.heroImage, locale)}
              className="absolute inset-0 h-[118%] w-full object-cover"
              loading="eager"
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
        className="absolute inset-0 bg-gradient-to-t from-brand-forest-deep via-brand-forest-deep/50 to-brand-black/20"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(136,196,60,0.18),transparent_42%),radial-gradient(circle_at_85%_20%,rgba(24,16,96,0.35),transparent_40%)]"
        aria-hidden="true"
      />
      <OrganicFloat className="opacity-70 mix-blend-screen" />

      <motion.div
        style={{ y: contentY }}
        className="relative container mx-auto flex min-h-[100svh] items-center px-4 pb-28 pt-[calc(var(--navbar-height)+3rem)] lg:px-8"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={`${slide.id}-copy`}
            className="max-w-3xl text-white"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.28, ease: easeOut }}
          >
            <motion.p
              className="mb-4 inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.24em] text-brand-lime sm:text-sm"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: easeOut, delay: 0.05 }}
            >
              <span className="h-px w-10 bg-brand-lime" aria-hidden="true" />
              Cargill
            </motion.p>
            {title ? <AnimatedTitle text={title} /> : null}
            {body ? (
              <motion.p
                className="mb-9 max-w-xl text-base leading-8 text-white/88 sm:text-lg lg:text-xl lg:leading-9"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: easeOut, delay: 0.28 }}
              >
                {body}
              </motion.p>
            ) : null}
            {href && ctaLabel ? (
              <MagneticButton className="inline-flex">
                <CtaLink
                  href={href}
                  className="inline-flex min-h-12 items-center justify-center rounded-md bg-brand-lime px-8 py-3.5 text-sm font-extrabold text-brand-ink shadow-[0_16px_40px_rgba(136,196,60,0.28)] transition-all duration-300 hover:bg-brand-lime-hover"
                >
                  {ctaLabel}
                </CtaLink>
              </MagneticButton>
            ) : null}
          </motion.div>
        </AnimatePresence>
      </motion.div>

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
                    className={`rounded-full transition-all duration-300 ${
                      active
                        ? "h-2.5 w-8 bg-brand-lime"
                        : "h-2.5 w-2.5 bg-white/50 hover:bg-white"
                    }`}
                  />
                );
              })}
            </div>

            <div className="pointer-events-auto flex items-center gap-3">
              <button
                type="button"
                onClick={() => goTo(safeIndex - 1)}
                aria-label={t(UI.prevSlide, locale)}
                className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/70 bg-white/5 text-white backdrop-blur-sm transition-all duration-300 hover:bg-brand-lime hover:text-brand-ink"
              >
                <IoChevronBack className="text-xl rtl:rotate-180" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => goTo(safeIndex + 1)}
                aria-label={t(UI.nextSlide, locale)}
                className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/70 bg-white/5 text-white backdrop-blur-sm transition-all duration-300 hover:bg-brand-lime hover:text-brand-ink"
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
