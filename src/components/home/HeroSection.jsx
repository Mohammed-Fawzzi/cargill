import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import CtaLink from "@/components/ui/CtaLink";
import SafeImage from "@/components/ui/SafeImage";
import MagneticButton from "@/components/ui/MagneticButton";
import OrganicFloat from "@/components/ui/OrganicFloat";
import { useLocale } from "@/context/LocaleContext";
import { useSiteData } from "@/context/SiteDataContext";
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

export default function HeroSection({ section }) {
  const { locale } = useLocale();
  const { contact } = useSiteData();
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
  const brand = t(contact?.companyName, locale) || "Cargill";

  useEffect(() => {
    setIndex(0);
  }, [slides.length]);

  useEffect(() => {
    if (!multi || paused) return undefined;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [multi, paused, slides.length]);

  if (!slides.length) return null;

  const safeIndex = index % slides.length;
  const slide = slides[safeIndex] || slides[0];
  const title = t(slide.title, locale);
  const body = t(slide.body, locale);
  const ctaLabel = t(slide.cta?.label, locale) || t(UI.readTheStory, locale);
  const href = slide.cta?.href || "/articles";

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
          className="absolute inset-0 overflow-hidden"
          style={{ y: imageY }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.55, ease: easeOut }}
        >
          {slide.imageUrl ? (
            <motion.div
              className="absolute inset-0 will-change-transform"
              initial={{ scale: 1 }}
              animate={
                multi
                  ? { scale: 1.12 }
                  : { scale: [1, 1.12, 1] }
              }
              transition={
                multi
                  ? { duration: AUTOPLAY_MS / 1000, ease: "linear" }
                  : { duration: 14, ease: "easeInOut", repeat: Infinity }
              }
            >
              <SafeImage
                src={slide.imageUrl}
                alt={title || t(UI.heroImage, locale)}
                className="absolute inset-0 h-full w-full object-cover"
                loading="eager"
                fetchPriority="high"
                width={1920}
              />
            </motion.div>
          ) : (
            <div
              className="absolute inset-0 bg-gradient-to-br from-brand-forest via-brand-forest-deep to-brand-black"
              aria-hidden="true"
            />
          )}
        </motion.div>
      </AnimatePresence>

      <div
        className="absolute inset-0 bg-gradient-to-t from-brand-forest-deep via-brand-forest-deep/55 to-brand-black/25"
        aria-hidden="true"
      />
      <OrganicFloat className="opacity-60 mix-blend-screen" />

      <motion.div
        style={{ y: contentY }}
        className="relative container mx-auto flex min-h-[100svh] items-end px-4 pb-32 pt-[calc(var(--navbar-height)+2rem)] sm:items-center sm:pb-28 lg:px-8 lg:pb-32"
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
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-brand-lime sm:text-sm">
              {t(UI.storyEyebrow, locale)} · {brand}
            </p>
            {title ? (
              <motion.h1
                className="mb-4 text-[1.85rem] font-extrabold leading-[1.15] tracking-tight sm:mb-5 sm:text-5xl lg:text-6xl xl:text-[4.4rem]"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: easeOut }}
              >
                {title}
              </motion.h1>
            ) : null}
            {body ? (
              <p className="mb-8 max-w-xl text-base leading-8 text-white/88 sm:text-lg lg:text-xl lg:leading-9">
                {body}
              </p>
            ) : null}
            {href && ctaLabel ? (
              <MagneticButton className="inline-flex">
                <CtaLink
                  href={href}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-brand-lime px-8 py-3.5 text-sm font-extrabold uppercase tracking-[0.06em] text-brand-ink shadow-[0_16px_40px_rgba(136,196,60,0.28)] transition-all duration-300 hover:bg-brand-lime-hover"
                >
                  <span>{ctaLabel}</span>
                  <span aria-hidden="true">→</span>
                </CtaLink>
              </MagneticButton>
            ) : null}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {multi ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10">
          <div className="container mx-auto flex items-end justify-between gap-3 px-4 pb-28 sm:pb-24 lg:px-8 lg:pb-28">
            <div className="pointer-events-auto flex items-center gap-2 sm:gap-2.5">
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
                        ? "h-2 w-7 bg-brand-lime sm:h-2.5 sm:w-8"
                        : "h-2 w-2 bg-white/50 hover:bg-white sm:h-2.5 sm:w-2.5"
                    }`}
                  />
                );
              })}
            </div>

            <div className="pointer-events-auto flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => goTo(safeIndex - 1)}
                aria-label={t(UI.prevSlide, locale)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-white/5 text-white backdrop-blur-sm transition-all duration-300 hover:bg-brand-lime hover:text-brand-ink sm:h-12 sm:w-12"
              >
                <IoChevronBack className="text-xl rtl:rotate-180" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => goTo(safeIndex + 1)}
                aria-label={t(UI.nextSlide, locale)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-white/5 text-white backdrop-blur-sm transition-all duration-300 hover:bg-brand-lime hover:text-brand-ink sm:h-12 sm:w-12"
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
