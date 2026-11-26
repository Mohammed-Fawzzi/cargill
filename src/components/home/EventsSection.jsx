import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import SafeMedia from "@/components/ui/SafeMedia";
import { useLocale } from "@/context/LocaleContext";
import { eventDayKey } from "@/lib/time";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";
import SectionRule from "@/components/ui/SectionRule";
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

function getEventParts(date, locale) {
  const key = eventDayKey(date);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) {
    return { day: "", monthYear: "", full: "" };
  }
  const [year, month, day] = key.split("-").map(Number);
  const value = new Date(year, month - 1, day);
  try {
    return {
      day: String(day),
      monthYear: new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "ar-EG", {
        month: "long",
        year: "numeric",
      }).format(value),
      full: new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "ar-EG", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(value),
    };
  } catch {
    return { day: String(day), monthYear: key, full: key };
  }
}

function EventRow({ item, locale, single }) {
  const title = t(item.title, locale);
  const details = t(item.details, locale);
  const parts = getEventParts(item.date, locale);
  const upcoming = item.status === "upcoming";

  return (
    <Link
      to={`/events/${item.id}`}
      className="group relative block border-b border-line/15 py-7 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime focus-visible:ring-offset-2 sm:py-8"
    >
      <div className="grid grid-cols-1 gap-5 md:hidden">
        <div className="curtain-frame overflow-hidden rounded-md bg-surface-muted">
          {item.imageUrl || item.videoUrl ? (
            <SafeMedia
              src={item.imageUrl}
              videoUrl={item.videoUrl || ""}
              alt={title}
              width={900}
              loading="lazy"
              className="aspect-[4/3] h-full w-full object-cover"
            />
          ) : (
            <div className="flex aspect-[4/3] items-center justify-center bg-surface-muted text-sm font-bold text-ink/40">
              {title}
            </div>
          )}
          {item.imageUrl || item.videoUrl ? (
            <div className="curtain-card__cover">
              <SafeMedia
                src={item.imageUrl}
                videoUrl={item.videoUrl || ""}
                alt=""
                width={900}
                className="curtain-card__photo is-cover"
              />
              <div className="curtain-card__shade" />
            </div>
          ) : null}
        </div>
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            {upcoming ? (
              <span className="text-[11px] font-bold tracking-[0.14em] text-brand-lime">
                {t(UI.upcoming, locale)}
              </span>
            ) : null}
            {parts.full ? (
              <p className="text-sm text-text-muted">{parts.full}</p>
            ) : null}
          </div>
          <h3 className="mb-2 text-xl font-extrabold tracking-tight text-ink">
            {title}
          </h3>
          {details ? (
            <p className="line-clamp-2 text-sm leading-7 text-text-muted">
              {details}
            </p>
          ) : null}
        </div>
      </div>

      <div
        className={`hidden items-start gap-6 md:grid ${
          single ? "md:grid-cols-12" : "md:grid-cols-12"
        }`}
      >
        <div className="md:col-span-2">
          {upcoming ? (
            <p className="mb-2 text-[11px] font-bold tracking-[0.14em] text-brand-lime">
              {t(UI.upcoming, locale)}
            </p>
          ) : null}
          {parts.day ? (
            <p className="text-clip-safe text-5xl font-extrabold leading-none tracking-tight text-ink lg:text-[4rem]">
              {parts.day}
            </p>
          ) : null}
          {parts.monthYear ? (
            <p className="mt-2 text-sm text-text-muted">{parts.monthYear}</p>
          ) : null}
        </div>

        <div className={single ? "md:col-span-4" : "md:col-span-6"}>
          <h3 className="mb-3 text-[1.4rem] font-extrabold leading-snug tracking-tight text-ink lg:text-[1.625rem]">
            {title}
          </h3>
          {details ? (
            <p className="line-clamp-2 text-base leading-8 text-text-muted">
              {details}
            </p>
          ) : null}
        </div>

        <div className={single ? "md:col-span-6" : "md:col-span-4"}>
          <div className="curtain-frame overflow-hidden rounded-md bg-page">
            {item.imageUrl || item.videoUrl ? (
              <SafeMedia
                src={item.imageUrl}
                videoUrl={item.videoUrl || ""}
                alt={title}
                width={single ? 1100 : 720}
                loading="lazy"
                className="aspect-[4/3] h-full w-full object-cover"
              />
            ) : (
              <div className="flex aspect-[4/3] items-center justify-center bg-page text-sm font-bold text-ink/40">
                {title}
              </div>
            )}
            {item.imageUrl || item.videoUrl ? (
              <div className="curtain-card__cover">
                <SafeMedia
                  src={item.imageUrl}
                  videoUrl={item.videoUrl || ""}
                  alt=""
                  width={single ? 1100 : 720}
                  className="curtain-card__photo is-cover"
                />
                <div className="curtain-card__shade" />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function EventsSection({ section }) {
  const { locale } = useLocale();
  const reducedMotion = usePrefersReducedMotion();
  const title = t(section?.data?.title, locale);
  const body = t(section?.data?.body, locale);

  const items = useMemo(() => {
    const list = (section?.items || []).filter(Boolean);
    return [...list]
      .sort((a, b) => {
        const byDate = eventDayKey(b.date).localeCompare(eventDayKey(a.date));
        return byDate !== 0 ? byDate : (b.createdAt || 0) - (a.createdAt || 0);
      })
      .slice(0, 4);
  }, [section?.items]);

  if (!items.length) return null;

  const single = items.length === 1;

  return (
    <section className="bg-surface-muted py-[4.5rem] lg:py-[7.5rem]">
      <motion.div
        className="container mx-auto px-4 lg:px-8"
        initial={reducedMotion ? false : { opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.12 }}
        transition={{ duration: 0.35, ease: easeOut }}
      >
        <SectionRule
          label={t(UI.nav.events, locale)}
          number="07"
          labelClassName="text-ink"
          numberClassName="text-ink/55"
          lineClassName="bg-brand-navy"
        />

        <div className="mb-10 flex flex-col gap-4 sm:mb-12 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <h2 className="text-clip-safe text-3xl font-extrabold tracking-tight text-ink sm:text-4xl lg:text-[2.75rem]">
              {title || t(UI.nav.events, locale)}
            </h2>
            {body ? (
              <p className="mt-3 text-sm leading-7 text-text-muted sm:text-base sm:leading-8">
                {body}
              </p>
            ) : null}
          </div>
          <Link
            to="/events"
            className="inline-flex w-fit items-center gap-2 border-b-2 border-brand-lime pb-0.5 text-sm font-bold text-ink transition-[border-width] hover:border-b-[3px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime focus-visible:ring-offset-2"
          >
            <span>{t(UI.allEventsLink, locale)}</span>
            <span aria-hidden="true">←</span>
          </Link>
        </div>

        <div className="border-t border-line/15">
          {items.map((item) => (
            <EventRow
              key={item.id}
              item={item}
              locale={locale}
              single={single}
            />
          ))}
        </div>
      </motion.div>
    </section>
  );
}
