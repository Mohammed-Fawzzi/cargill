import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import SafeImage from "@/components/ui/SafeImage";
import { useLocale } from "@/context/LocaleContext";
import { dirFor, t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";

const AUTOPLAY_MS = 6000;

export default function StoriesCarousel({
  items = [],
  getTitle,
  getBody,
  getHref,
  getImage,
}) {
  const { locale } = useLocale();
  const slides = useMemo(() => items.filter(Boolean), [items]);
  const [index, setIndex] = useState(0);
  const [perView, setPerView] = useState(2);
  const [paused, setPaused] = useState(false);
  const rtl = dirFor(locale) === "rtl";

  useEffect(() => {
    const update = () => {
      setPerView(window.innerWidth < 768 ? 1 : 2);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    setIndex(0);
  }, [slides.length, perView]);

  const maxIndex = Math.max(0, slides.length - perView);

  useEffect(() => {
    if (slides.length <= perView || paused) return undefined;
    const timer = window.setInterval(() => {
      setIndex((current) => (current >= maxIndex ? 0 : current + 1));
    }, AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [slides.length, perView, paused, maxIndex]);

  if (!slides.length) return null;

  const safeIndex = Math.min(index, maxIndex);
  const pageCount = maxIndex + 1;
  const step = 100 / perView;
  const offset = (rtl ? 1 : -1) * safeIndex * step;

  const goPrev = () => setIndex((current) => Math.max(0, current - 1));
  const goNext = () => setIndex((current) => Math.min(maxIndex, current + 1));

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <button
        type="button"
        onClick={goPrev}
        disabled={safeIndex === 0}
        aria-label={t(UI.prevSlide, locale)}
        className="absolute start-0 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-line/10 bg-page text-ink/45 shadow-sm transition-all hover:border-brand-lime hover:text-ink disabled:opacity-30 md:inline-flex lg:-start-1"
      >
        <IoChevronBack className="text-xl rtl:rotate-180" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={goNext}
        disabled={safeIndex >= maxIndex}
        aria-label={t(UI.nextSlide, locale)}
        className="absolute end-0 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-line/10 bg-page text-ink/45 shadow-sm transition-all hover:border-brand-lime hover:text-ink disabled:opacity-30 md:inline-flex lg:-end-1"
      >
        <IoChevronForward className="text-xl rtl:rotate-180" aria-hidden="true" />
      </button>

      <div className="overflow-hidden px-1 md:px-14">
        <div
          className="flex transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ transform: `translate3d(${offset}%, 0, 0)` }}
        >
          {slides.map((item) => {
            const title = getTitle(item, locale);
            const body = getBody?.(item, locale) || "";
            const href = getHref(item);
            const imageUrl = getImage?.(item) || "";
            return (
              <article
                key={item.id}
                className="shrink-0 px-3"
                style={{ width: `${step}%` }}
              >
                <Link
                  to={href}
                  className="group relative flex min-h-[280px] overflow-hidden rounded-[1.5rem] bg-brand-forest-deep shadow-[0_14px_40px_rgba(24,16,96,0.12)] sm:min-h-[320px]"
                >
                  {imageUrl ? (
                    <SafeImage
                      src={imageUrl}
                      alt={title}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-moss to-brand-forest-deep" />
                  )}
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-brand-forest-deep via-brand-forest-deep/50 to-transparent"
                    aria-hidden="true"
                  />
                  <div className="relative mt-auto p-5 text-white sm:p-6">
                    {title ? (
                      <h3 className="mb-2 text-lg font-extrabold leading-7 sm:text-xl">
                        {title}
                      </h3>
                    ) : null}
                    {body ? (
                      <p className="mb-3 line-clamp-2 text-sm leading-6 text-white/75">
                        {body}
                      </p>
                    ) : null}
                    <span className="text-sm font-bold text-brand-lime transition-all group-hover:tracking-wide">
                      {t(UI.readMore, locale)} →
                    </span>
                  </div>
                </Link>
              </article>
            );
          })}
        </div>
      </div>

      {pageCount > 1 ? (
        <div className="mt-8 flex items-center justify-center gap-2">
          {Array.from({ length: pageCount }).map((_, pageIndex) => (
            <button
              key={pageIndex}
              type="button"
              aria-label={`${pageIndex + 1}`}
              aria-current={pageIndex === safeIndex ? "true" : undefined}
              onClick={() => setIndex(pageIndex)}
              className={`rounded-full transition-all ${
                pageIndex === safeIndex
                  ? "h-2.5 w-7 bg-brand-lime"
                  : "h-2.5 w-2.5 bg-brand-navy/20 hover:bg-brand-navy/45"
              }`}
            />
          ))}
        </div>
      ) : null}

      <div className="mt-6 flex justify-center gap-3 md:hidden">
        <button
          type="button"
          onClick={goPrev}
          disabled={safeIndex === 0}
          aria-label={t(UI.prevSlide, locale)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line/20 text-ink disabled:opacity-30"
        >
          <IoChevronBack className="rtl:rotate-180" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={goNext}
          disabled={safeIndex >= maxIndex}
          aria-label={t(UI.nextSlide, locale)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line/20 text-ink disabled:opacity-30"
        >
          <IoChevronForward className="rtl:rotate-180" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
