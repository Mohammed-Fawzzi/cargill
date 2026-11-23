import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import { useLocale } from "@/context/LocaleContext";
import { dirFor, t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";

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

  if (!slides.length) return null;

  const maxIndex = Math.max(0, slides.length - perView);
  const safeIndex = Math.min(index, maxIndex);
  const pageCount = maxIndex + 1;
  const step = 100 / perView;
  const offset = (rtl ? 1 : -1) * safeIndex * step;

  const goPrev = () => setIndex((current) => Math.max(0, current - 1));
  const goNext = () => setIndex((current) => Math.min(maxIndex, current + 1));

  return (
    <div className="relative">
      <button
        type="button"
        onClick={goPrev}
        disabled={safeIndex === 0}
        aria-label={t(UI.prevSlide, locale)}
        className="absolute start-0 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center text-4xl text-brand-ink/35 transition-colors hover:text-brand-ink disabled:opacity-30 md:inline-flex lg:-start-2"
      >
        <IoChevronBack className="rtl:rotate-180" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={goNext}
        disabled={safeIndex >= maxIndex}
        aria-label={t(UI.nextSlide, locale)}
        className="absolute end-0 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center text-4xl text-brand-ink/35 transition-colors hover:text-brand-ink disabled:opacity-30 md:inline-flex lg:-end-2"
      >
        <IoChevronForward className="rtl:rotate-180" aria-hidden="true" />
      </button>

      <div className="overflow-hidden px-1 md:px-12">
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
                <div className="flex h-full min-h-[7.5rem] items-center gap-4 border border-black/10 bg-white p-4 transition-shadow duration-300 hover:shadow-[0_12px_32px_rgba(12,18,14,0.08)] sm:gap-5 sm:p-5">
                  <div className="h-20 w-20 shrink-0 overflow-hidden bg-surface-muted sm:h-24 sm:w-24">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="h-full w-full bg-brand-forest/10" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    {title ? (
                      <h3 className="mb-2 text-base font-bold leading-7 text-brand-lime sm:text-lg">
                        <Link
                          to={href}
                          className="transition-colors hover:text-brand-moss"
                        >
                          {title}
                        </Link>
                      </h3>
                    ) : null}
                    {body ? (
                      <p className="mb-2 line-clamp-2 text-sm leading-6 text-text-muted">
                        {body}
                      </p>
                    ) : null}
                    <Link
                      to={href}
                      className="text-sm font-semibold text-brand-ink underline-offset-4 transition-colors hover:text-brand-lime hover:underline"
                    >
                      {t(UI.readMore, locale)}
                    </Link>
                  </div>
                </div>
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
                  ? "h-2.5 w-2.5 bg-brand-ink"
                  : "h-2 w-2 bg-brand-ink/25 hover:bg-brand-ink/50"
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
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand-ink/20 text-brand-ink disabled:opacity-30"
        >
          <IoChevronBack className="rtl:rotate-180" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={goNext}
          disabled={safeIndex >= maxIndex}
          aria-label={t(UI.nextSlide, locale)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand-ink/20 text-brand-ink disabled:opacity-30"
        >
          <IoChevronForward className="rtl:rotate-180" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
