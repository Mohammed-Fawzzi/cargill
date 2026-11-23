import React, { useEffect, useState } from "react";
import CtaLink from "@/components/ui/CtaLink";
import { useLocale } from "@/context/LocaleContext";
import { t } from "@/lib/i18n";

export default function HeroSection({ section }) {
  const { locale } = useLocale();
  const slides = section?.data?.slides || [];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return undefined;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, 7000);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  if (!slides.length) return null;

  const slide = slides[index] || slides[0];
  const title = t(slide.title, locale);
  const body = t(slide.body, locale);
  const ctaLabel = t(slide.cta?.label, locale);
  const href = slide.cta?.href;

  return (
    <section className="relative min-h-[78vh] overflow-hidden bg-brand-black pt-navbar">
      {slide.imageUrl ? (
        <img
          key={slide.id}
          src={slide.imageUrl}
          alt={title}
          className="hero-fade absolute inset-0 h-full w-full object-cover"
        />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-l from-brand-black/85 via-brand-forest-deep/70 to-brand-black/40" />

      <div className="relative container mx-auto flex min-h-[78vh] items-center px-4 py-16 lg:px-8">
        <div className="max-w-2xl text-white">
          <span className="mb-5 inline-block h-10 w-1.5 rounded-full bg-brand-lime align-middle" />
          {title ? (
            <h1 className="mb-5 text-3xl font-extrabold leading-tight sm:text-5xl">
              {title}
            </h1>
          ) : null}
          {body ? (
            <p className="mb-8 max-w-xl text-sm leading-8 text-white/80 sm:text-lg">
              {body}
            </p>
          ) : null}
          {href && ctaLabel ? (
            <CtaLink
              href={href}
              className="inline-flex rounded-full bg-brand-lime px-7 py-3 text-sm font-extrabold text-brand-black transition-colors hover:bg-brand-lime-hover"
            >
              {ctaLabel}
            </CtaLink>
          ) : null}
        </div>
      </div>

      {slides.length > 1 ? (
        <div className="absolute inset-x-0 bottom-6 flex justify-center gap-2">
          {slides.map((item, itemIndex) => (
            <button
              key={item.id}
              type="button"
              aria-label={t(item.title, locale) || `slide ${itemIndex + 1}`}
              onClick={() => setIndex(itemIndex)}
              className={`h-2.5 rounded-full transition-all ${
                itemIndex === index
                  ? "w-8 bg-brand-lime"
                  : "w-2.5 bg-white/50 hover:bg-white"
              }`}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
