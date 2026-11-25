import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import SafeImage from "@/components/ui/SafeImage";
import LtrText from "@/components/ui/LtrText";
import { useLocale } from "@/context/LocaleContext";
import { eventDayKey } from "@/lib/time";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";
import { easeOut } from "@/lib/motion";

function daysUntil(date) {
  const key = eventDayKey(date);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) return null;
  const [year, month, day] = key.split("-").map(Number);
  const target = new Date(year, month - 1, day);
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diff = Math.ceil((target - start) / (1000 * 60 * 60 * 24));
  return diff;
}

export function getEventParts(date, locale) {
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

export default function EventAgendaRow({
  item,
  compact = false,
  showImage = true,
}) {
  const { locale } = useLocale();
  const reduceMotion = useReducedMotion();
  const title = t(item.title, locale);
  const details = t(item.details, locale);
  const location = t(item.location, locale);
  const time = String(item.time || "").trim();
  const parts = getEventParts(item.date, locale);
  const upcoming = item.status === "upcoming";
  const meta = [location, time].filter(Boolean).join(" · ");
  const remaining = useMemo(() => daysUntil(item.date), [item.date]);
  const countdownLabel =
    upcoming && remaining != null && remaining > 0
      ? remaining === 1
        ? t(UI.dayLeft, locale)
        : t(UI.daysLeft, locale).replace("{n}", String(remaining))
      : "";

  return (
    <Link
      to={`/events/${item.id}`}
      className="group relative block border-b border-line/15 py-7 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime focus-visible:ring-offset-2 sm:py-8"
    >
      <span
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px origin-right scale-x-0 bg-brand-lime transition-transform duration-500 group-hover:scale-x-100 motion-reduce:transition-none"
        aria-hidden="true"
      />

      <div className="grid grid-cols-1 gap-5 md:hidden">
        {showImage && !compact ? (
          <div className="overflow-hidden rounded-md bg-surface-muted">
            {item.imageUrl ? (
              <SafeImage
                src={item.imageUrl}
                alt={title}
                className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              />
            ) : (
              <div className="flex aspect-[4/3] items-center justify-center text-sm font-bold text-ink/40">
                {title}
              </div>
            )}
          </div>
        ) : null}
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            {upcoming ? (
              <span className="text-[11px] font-bold tracking-[0.14em] text-brand-lime">
                {t(UI.upcoming, locale)}
              </span>
            ) : (
              <span className="text-[11px] font-bold tracking-[0.14em] text-text-muted">
                {t(UI.eventEnded, locale)}
              </span>
            )}
            {parts.full ? (
              <p className="text-sm text-text-muted">{parts.full}</p>
            ) : null}
          </div>
          <h3
            className={`font-extrabold tracking-tight text-ink ${
              compact ? "text-lg" : "text-xl"
            }`}
          >
            {title}
          </h3>
          {!compact && meta ? (
            <p className="mt-2 text-sm text-text-muted">{meta}</p>
          ) : null}
          {!compact && details ? (
            <p className="mt-2 line-clamp-2 text-sm leading-7 text-text-muted">
              {details}
            </p>
          ) : null}
          {!compact ? (
            <span className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-ink underline decoration-brand-lime decoration-2 underline-offset-6">
              {t(UI.eventDetailsLink, locale)}
              <span
                className="transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1 motion-reduce:transition-none"
                aria-hidden="true"
              >
                →
              </span>
            </span>
          ) : null}
        </div>
      </div>

      {!compact ? (
        <div className="hidden items-start gap-6 md:grid md:grid-cols-12">
          <div className="md:col-span-2">
            {upcoming ? (
              <p className="mb-2 text-[11px] font-bold tracking-[0.14em] text-brand-lime">
                {t(UI.upcoming, locale)}
              </p>
            ) : null}
            {parts.day ? (
              <motion.p
                className={`overflow-hidden text-[4.5rem] font-extrabold leading-none tracking-tight ${
                  upcoming ? "text-ink" : "text-text-muted"
                }`}
                initial={reduceMotion ? false : { y: "100%", opacity: 0 }}
                whileInView={{ y: "0%", opacity: 1 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.45, ease: easeOut }}
              >
                <LtrText>{parts.day}</LtrText>
              </motion.p>
            ) : null}
            {parts.monthYear ? (
              <p className="mt-2 text-sm text-text-muted">{parts.monthYear}</p>
            ) : null}
            {countdownLabel ? (
              <p className="mt-3 text-xs font-bold tracking-wide text-brand-lime">
                {countdownLabel}
              </p>
            ) : null}
          </div>

          <div className="md:col-span-6">
            <h3 className="mb-3 text-[1.75rem] font-extrabold leading-snug tracking-tight text-ink">
              {title}
            </h3>
            {meta ? <p className="mb-3 text-sm text-text-muted">{meta}</p> : null}
            {details ? (
              <p className="mb-4 line-clamp-2 text-base leading-8 text-text-muted">
                {details}
              </p>
            ) : null}
            <span className="inline-flex items-center gap-2 text-sm font-bold text-ink underline decoration-brand-lime decoration-2 underline-offset-6">
              {t(UI.eventDetailsLink, locale)}
              <span
                className="transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1 motion-reduce:transition-none"
                aria-hidden="true"
              >
                →
              </span>
            </span>
          </div>

          {showImage ? (
            <div className="md:col-span-4">
              <div className="overflow-hidden rounded-md bg-surface-muted">
                {item.imageUrl ? (
                  <SafeImage
                    src={item.imageUrl}
                    alt={title}
                    className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  />
                ) : (
                  <div className="flex aspect-[4/3] items-center justify-center text-sm font-bold text-ink/40">
                    {title}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="hidden items-center gap-6 md:grid md:grid-cols-12">
          <div className="md:col-span-2">
            {parts.day ? (
              <p
                className={`text-4xl font-extrabold leading-none tracking-tight ${
                  upcoming ? "text-ink" : "text-text-muted"
                }`}
              >
                {parts.day}
              </p>
            ) : null}
            {parts.monthYear ? (
              <p className="mt-1 text-xs text-text-muted">{parts.monthYear}</p>
            ) : null}
          </div>
          <div className="md:col-span-10">
            <h3 className="text-xl font-extrabold tracking-tight text-ink">
              {title}
            </h3>
          </div>
        </div>
      )}
    </Link>
  );
}
