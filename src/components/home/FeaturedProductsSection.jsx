import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import Reveal from "@/components/ui/Reveal";
import { EmptyState } from "@/components/ui/StatusMessage";
import { useLocale } from "@/context/LocaleContext";
import { dirFor, t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";

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

  if (!items.length && !title && !body) return null;

  const maxIndex = Math.max(0, items.length - perView);
  const safeIndex = Math.min(index, maxIndex);
  const pageCount = maxIndex + 1;
  const step = 100 / perView;
  const offset = (rtl ? 1 : -1) * safeIndex * step;

  const goPrev = () => setIndex((current) => Math.max(0, current - 1));
  const goNext = () => setIndex((current) => Math.min(maxIndex, current + 1));

  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="container mx-auto px-4 lg:px-8">
        <Reveal className="mb-10 text-center lg:mb-14">
          {title ? (
            <h2 className="mb-3 text-3xl font-extrabold text-brand-ink sm:text-4xl">
              {title}
            </h2>
          ) : null}
          {body ? (
            <p className="mx-auto max-w-2xl text-sm leading-8 text-text-muted sm:text-base">
              {body}
            </p>
          ) : null}
        </Reveal>

        {items.length === 0 ? (
          <EmptyState />
        ) : (
          <Reveal delay={0.08}>
            <div className="relative">
              {pageCount > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={goPrev}
                    disabled={safeIndex === 0}
                    aria-label={t(UI.prevSlide, locale)}
                    className="absolute start-0 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center text-[42px] leading-none text-brand-ink/40 transition-colors hover:text-brand-ink disabled:opacity-25 md:inline-flex lg:start-0"
                  >
                    <IoChevronBack className="rtl:rotate-180" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    disabled={safeIndex >= maxIndex}
                    aria-label={t(UI.nextSlide, locale)}
                    className="absolute end-0 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center text-[42px] leading-none text-brand-ink/40 transition-colors hover:text-brand-ink disabled:opacity-25 md:inline-flex lg:end-0"
                  >
                    <IoChevronForward className="rtl:rotate-180" aria-hidden="true" />
                  </button>
                </>
              ) : null}

              <div className="overflow-hidden px-2 md:px-14 lg:px-16">
                <div
                  className="flex items-stretch transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                  style={{ transform: `translate3d(${offset}%, 0, 0)` }}
                >
                  {items.map((item, itemIndex) => {
                    const name = t(item.name, locale);
                    const href = `/products/${item.id}`;
                    const imageUrl = item.imageUrl || "";
                    const visibleStart = safeIndex;
                    const visibleEnd = safeIndex + perView - 1;
                    const isVisible =
                      itemIndex >= visibleStart && itemIndex <= visibleEnd;
                    const isSide =
                      perView > 1 &&
                      isVisible &&
                      (itemIndex === visibleStart || itemIndex === visibleEnd) &&
                      items.length > 1;
                    const tiltLeft = rtl
                      ? itemIndex === visibleEnd
                      : itemIndex === visibleStart;
                    const cardTransform = !isSide
                      ? "perspective(900px) rotateY(0deg) scale(1)"
                      : tiltLeft
                        ? "perspective(900px) rotateY(12deg) scale(0.96)"
                        : "perspective(900px) rotateY(-12deg) scale(0.96)";

                    return (
                      <article
                        key={item.id}
                        className="shrink-0 px-3 sm:px-4"
                        style={{ width: `${step}%` }}
                      >
                        <div
                          className="flex h-full min-h-[210px] flex-col items-center justify-center rounded-2xl border border-black/10 bg-white px-6 py-10 text-center shadow-[0_2px_0_rgba(0,0,0,0.02)] transition-transform duration-500 sm:min-h-[230px] sm:px-8 sm:py-12"
                          style={{ transform: cardTransform }}
                        >
                          {imageUrl ? (
                            <div className="mb-5 h-16 w-16 overflow-hidden rounded-full bg-surface-muted sm:h-20 sm:w-20">
                              <img
                                src={imageUrl}
                                alt={name}
                                className="h-full w-full object-cover"
                                loading="lazy"
                              />
                            </div>
                          ) : null}
                          {name ? (
                            <h3 className="mb-4 max-w-[16rem] text-xl font-bold leading-8 text-brand-lime sm:text-2xl">
                              <Link
                                to={href}
                                className="transition-colors hover:text-brand-moss"
                              >
                                {name}
                              </Link>
                            </h3>
                          ) : null}
                          <Link
                            to={href}
                            className="text-sm font-bold text-brand-ink transition-colors hover:text-brand-lime"
                          >
                            {t(UI.readMore, locale)}
                          </Link>
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
                          : "h-2 w-2 bg-brand-ink/25 hover:bg-brand-ink/45"
                      }`}
                    />
                  ))}
                </div>
              ) : null}

              {pageCount > 1 ? (
                <div className="mt-6 flex justify-center gap-4 md:hidden">
                  <button
                    type="button"
                    onClick={goPrev}
                    disabled={safeIndex === 0}
                    aria-label={t(UI.prevSlide, locale)}
                    className="text-3xl text-brand-ink/45 disabled:opacity-25"
                  >
                    <IoChevronBack className="rtl:rotate-180" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    disabled={safeIndex >= maxIndex}
                    aria-label={t(UI.nextSlide, locale)}
                    className="text-3xl text-brand-ink/45 disabled:opacity-25"
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
