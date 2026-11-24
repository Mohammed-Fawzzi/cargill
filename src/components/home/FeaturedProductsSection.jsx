import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import Reveal from "@/components/ui/Reveal";
import SafeImage from "@/components/ui/SafeImage";
import MagneticButton from "@/components/ui/MagneticButton";
import { EmptyState } from "@/components/ui/StatusMessage";
import { useLocale } from "@/context/LocaleContext";
import { dirFor, t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";

const AUTOPLAY_MS = 5500;

export default function FeaturedProductsSection({ section }) {
  const { locale } = useLocale();
  const items = useMemo(
    () => (section?.items || []).filter(Boolean),
    [section?.items],
  );
  const title = t(section?.data?.title, locale);
  const body = t(section?.data?.body, locale);
  const rtl = dirFor(locale) === "rtl";
  const [index, setIndex] = useState(0);
  const [perView, setPerView] = useState(2);
  const [paused, setPaused] = useState(false);

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
  }, [items.length, perView]);

  const maxIndex = Math.max(0, items.length - perView);

  useEffect(() => {
    if (items.length <= perView || paused) return undefined;
    const timer = window.setInterval(() => {
      setIndex((current) => (current >= maxIndex ? 0 : current + 1));
    }, AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [items.length, perView, paused, maxIndex]);

  if (!items.length && !title && !body) return null;

  const safeIndex = Math.min(index, maxIndex);
  const pageCount = maxIndex + 1;
  const step = 100 / perView;
  const offset = (rtl ? 1 : -1) * safeIndex * step;

  const goPrev = () => setIndex((current) => Math.max(0, current - 1));
  const goNext = () => setIndex((current) => Math.min(maxIndex, current + 1));

  return (
    <section className="relative overflow-hidden bg-surface-muted py-16 lg:py-24">
      <div
        className="pointer-events-none absolute -start-24 top-24 h-64 w-64 rounded-full bg-brand-lime/15 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -end-20 bottom-10 h-72 w-72 rounded-full bg-brand-moss/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative container mx-auto px-4 lg:px-8">
        <Reveal className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end lg:mb-14">
          <div className="max-w-2xl">
            {title ? (
              <h2 className="mb-3 text-3xl font-extrabold tracking-tight text-brand-ink sm:text-4xl lg:text-[2.75rem]">
                {title}
              </h2>
            ) : null}
            {body ? (
              <p className="text-sm leading-8 text-text-muted sm:text-base">{body}</p>
            ) : null}
          </div>
          <MagneticButton>
            <Link
              to="/products"
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-brand-ink/15 bg-white px-6 text-sm font-bold text-brand-ink transition-all duration-300 hover:border-brand-lime hover:bg-brand-lime"
            >
              {t(UI.viewAll, locale)}
            </Link>
          </MagneticButton>
        </Reveal>

        {items.length === 0 ? (
          <EmptyState />
        ) : (
          <Reveal delay={0.08}>
            <div
              className="relative"
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
            >
              {pageCount > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={goPrev}
                    disabled={safeIndex === 0}
                    aria-label={t(UI.prevSlide, locale)}
                    className="absolute start-0 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-brand-ink/10 bg-white text-brand-ink/50 shadow-sm transition-all hover:border-brand-lime hover:text-brand-ink disabled:opacity-25 md:inline-flex"
                  >
                    <IoChevronBack className="text-xl rtl:rotate-180" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    disabled={safeIndex >= maxIndex}
                    aria-label={t(UI.nextSlide, locale)}
                    className="absolute end-0 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-brand-ink/10 bg-white text-brand-ink/50 shadow-sm transition-all hover:border-brand-lime hover:text-brand-ink disabled:opacity-25 md:inline-flex"
                  >
                    <IoChevronForward className="text-xl rtl:rotate-180" aria-hidden="true" />
                  </button>
                </>
              ) : null}

              <div className="overflow-hidden px-2 md:px-16 lg:px-20">
                <div
                  className="flex items-stretch transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                  style={{ transform: `translate3d(${offset}%, 0, 0)` }}
                >
                  {items.map((item) => {
                    const name = t(item.name, locale);
                    const href = `/products/${item.id}`;
                    const imageUrl = item.imageUrl || "";

                    return (
                      <article
                        key={item.id}
                        className="shrink-0 px-3 sm:px-4"
                        style={{ width: `${step}%` }}
                      >
                        <Link
                          to={href}
                          className="group relative flex min-h-[340px] overflow-hidden rounded-[1.75rem] bg-brand-forest-deep shadow-[0_16px_44px_rgba(24,16,96,0.14)] sm:min-h-[380px]"
                        >
                          {imageUrl ? (
                            <SafeImage
                              src={imageUrl}
                              alt={name}
                              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                          ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-brand-moss to-brand-forest-deep" />
                          )}
                          <div
                            className="absolute inset-0 bg-gradient-to-t from-brand-forest-deep via-brand-forest-deep/35 to-transparent"
                            aria-hidden="true"
                          />
                          <div
                            className="absolute inset-x-0 top-0 h-1 origin-start scale-x-0 bg-brand-lime transition-transform duration-500 group-hover:scale-x-100"
                            aria-hidden="true"
                          />
                          <div className="relative mt-auto p-6 text-white sm:p-8">
                            {name ? (
                              <h3 className="mb-3 text-xl font-extrabold leading-8 sm:text-2xl">
                                {name}
                              </h3>
                            ) : null}
                            <span className="inline-flex items-center gap-2 text-sm font-bold text-brand-lime transition-all group-hover:gap-3">
                              {t(UI.viewDetails, locale)}
                              <span aria-hidden="true">→</span>
                            </span>
                          </div>
                        </Link>
                      </article>
                    );
                  })}
                </div>
              </div>

              {pageCount > 1 ? (
                <div className="mt-9 flex items-center justify-center gap-2">
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
                          : "h-2.5 w-2.5 bg-brand-ink/20 hover:bg-brand-ink/40"
                      }`}
                    />
                  ))}
                </div>
              ) : null}

              {pageCount > 1 ? (
                <div className="mt-6 flex justify-center gap-3 md:hidden">
                  <button
                    type="button"
                    onClick={goPrev}
                    disabled={safeIndex === 0}
                    aria-label={t(UI.prevSlide, locale)}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-brand-ink/15 text-brand-ink disabled:opacity-25"
                  >
                    <IoChevronBack className="rtl:rotate-180" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    disabled={safeIndex >= maxIndex}
                    aria-label={t(UI.nextSlide, locale)}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-brand-ink/15 text-brand-ink disabled:opacity-25"
                  >
                    <IoChevronForward className="rtl:rotate-180" aria-hidden="true" />
                  </button>
                </div>
              ) : null}
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}
