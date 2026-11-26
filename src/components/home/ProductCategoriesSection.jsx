import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import Reveal from "@/components/ui/Reveal";
import SafeMedia from "@/components/ui/SafeMedia";
import { EmptyState } from "@/components/ui/StatusMessage";
import { useLocale } from "@/context/LocaleContext";
import { useSiteData } from "@/context/SiteDataContext";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";

const AUTOPLAY_MS = 5000;

export default function ProductCategoriesSection({ section }) {
  const { locale } = useLocale();
  const { contact } = useSiteData();
  const title = t(section?.data?.title, locale);
  const body = t(section?.data?.body, locale);
  const items = useMemo(() => (section?.items || []).filter(Boolean), [section?.items]);
  const brand = t(contact?.companyName, locale) || "Cargill";
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    setIndex(0);
  }, [items.length]);

  useEffect(() => {
    if (items.length <= 1 || paused) return undefined;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % items.length);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [items.length, paused]);

  if (!items.length && !title && !body) return null;

  const safeIndex = items.length ? index % items.length : 0;
  const current = items[safeIndex];
  const currentName = current ? t(current.name, locale) : "";

  const goPrev = () =>
    setIndex((currentIndex) => (currentIndex - 1 + items.length) % items.length);
  const goNext = () => setIndex((currentIndex) => (currentIndex + 1) % items.length);

  return (
    <section className="relative overflow-hidden bg-page py-16 lg:py-24">
      <div className="relative container mx-auto px-4 lg:px-8">
        <Reveal className="mx-auto mb-10 max-w-3xl text-center lg:mb-14">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-brand-moss">
            {t(UI.produceEfficiently, locale)}
          </p>
          <h2 className="mb-3 text-2xl font-extrabold tracking-tight text-ink sm:text-4xl lg:text-[2.75rem]">
            <span className="block">{t(UI.discoverEyebrow, locale)}</span>
            <span className="block text-brand-lime">{brand}</span>
          </h2>
          {body || title ? (
            <p className="mx-auto max-w-2xl text-sm leading-8 text-text-muted sm:text-base">
              {body || title}
            </p>
          ) : null}
        </Reveal>

        {items.length === 0 ? (
          <EmptyState />
        ) : (
          <div
            className="relative mx-auto max-w-3xl"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            {items.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={goPrev}
                  aria-label={t(UI.prevSlide, locale)}
                  className="absolute start-0 top-[38%] z-10 hidden h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-line/10 bg-page text-ink shadow-sm transition-colors hover:border-brand-lime hover:bg-brand-lime sm:inline-flex"
                >
                  <IoChevronBack className="text-xl rtl:rotate-180" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  aria-label={t(UI.nextSlide, locale)}
                  className="absolute end-0 top-[38%] z-10 hidden h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-line/10 bg-page text-ink shadow-sm transition-colors hover:border-brand-lime hover:bg-brand-lime sm:inline-flex"
                >
                  <IoChevronForward className="text-xl rtl:rotate-180" aria-hidden="true" />
                </button>
              </>
            ) : null}

            <div className="flex flex-col items-center px-2 sm:px-16 md:px-20">
              <Link
                to={`/products?section=${encodeURIComponent(current.id)}`}
                className="group relative mb-8 block aspect-square w-full max-w-[22rem] cursor-pointer overflow-hidden rounded-full shadow-[0_20px_50px_rgba(24,16,96,0.16)]"
              >
                {current.imageUrl || current.videoUrl ? (
                  <SafeMedia
                    src={current.imageUrl}
                    videoUrl={current.videoUrl || ""}
                    alt={currentName}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-moss to-brand-forest-deep px-6 text-center text-2xl font-extrabold text-white">
                    {currentName}
                  </div>
                )}
                <div
                  className="absolute inset-0 bg-gradient-to-t from-brand-black/55 via-transparent to-transparent opacity-80"
                  aria-hidden="true"
                />
              </Link>

              <h3 className="mb-3 text-center text-2xl font-extrabold uppercase tracking-[0.08em] text-ink sm:text-3xl">
                {currentName}
              </h3>
              <Link
                to={`/products?section=${encodeURIComponent(current.id)}`}
                className="inline-flex cursor-pointer items-center gap-2 text-sm font-extrabold uppercase tracking-[0.08em] text-brand-lime transition-all hover:gap-3"
              >
                {t(UI.knowMore, locale)}
                <span aria-hidden="true">→</span>
              </Link>

              {items.length > 1 ? (
                <>
                  <div className="mt-6 flex justify-center gap-3 sm:hidden">
                    <button
                      type="button"
                      onClick={goPrev}
                      aria-label={t(UI.prevSlide, locale)}
                      className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-line/15 text-ink"
                    >
                      <IoChevronBack className="rtl:rotate-180" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={goNext}
                      aria-label={t(UI.nextSlide, locale)}
                      className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-line/15 text-ink"
                    >
                      <IoChevronForward className="rtl:rotate-180" aria-hidden="true" />
                    </button>
                  </div>
                  <div className="mt-6 flex flex-wrap items-center justify-center gap-2 sm:mt-8">
                    {items.map((item, itemIndex) => {
                      const name = t(item.name, locale);
                      const active = itemIndex === safeIndex;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          aria-label={name}
                          aria-current={active ? "true" : undefined}
                          onClick={() => setIndex(itemIndex)}
                          className={`cursor-pointer rounded-full transition-all ${
                            active
                              ? "h-2.5 w-8 bg-brand-lime"
                              : "h-2.5 w-2.5 bg-brand-navy/20 hover:bg-brand-navy/40"
                          }`}
                        />
                      );
                    })}
                  </div>
                </>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
