import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import SafeImage from "@/components/ui/SafeImage";
import LtrText from "@/components/ui/LtrText";
import { useLocale } from "@/context/LocaleContext";
import { useSiteData } from "@/context/SiteDataContext";
import { downloadEventIcs, hasEventTime } from "@/lib/ics";
import { toWhatsAppHref } from "@/lib/phone";
import { eventDayKey } from "@/lib/time";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";
import { easeOut } from "@/lib/motion";
import useMotionPrefs from "@/hooks/useMotionPrefs";

function daysUntil(date) {
  const key = eventDayKey(date);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) return null;
  const [year, month, day] = key.split("-").map(Number);
  const target = new Date(year, month - 1, day);
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.ceil((target - start) / (1000 * 60 * 60 * 24));
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
  const { contact } = useSiteData();
  const { reducedMotion } = useMotionPrefs();
  const title = t(item.title, locale);
  const details = t(item.details, locale);
  const location = t(item.location, locale);
  const time = String(item.time || "").trim();
  const parts = getEventParts(item.date, locale);
  const upcoming = item.status === "upcoming";
  const remaining = useMemo(() => daysUntil(item.date), [item.date]);
  const countdownLabel =
    upcoming && remaining != null && remaining > 0
      ? remaining === 1
        ? t(UI.dayLeft, locale)
        : t(UI.daysLeft, locale).replace("{n}", String(remaining))
      : "";

  const phone = contact?.phones?.[0] || "";
  const dateLabel = parts.full;
  const waHref =
    upcoming &&
    toWhatsAppHref(
      phone,
      t(UI.bookEventMessage, locale)
        .replace("{title}", title || "")
        .replace("{date}", dateLabel || ""),
    );
  const canAddToCalendar =
    upcoming && hasEventTime(time) && eventDayKey(item.date);

  const onAddToCalendar = (event) => {
    event.preventDefault();
    event.stopPropagation();
    downloadEventIcs(
      {
        title,
        date: item.date,
        time,
        location,
        description: details,
        url:
          typeof window !== "undefined"
            ? `${window.location.origin}/events/${item.id}`
            : "",
      },
      `${eventDayKey(item.date) || "event"}.ics`,
    );
  };

  if (compact) {
    return (
      <Link
        to={`/events/${item.id}`}
        className="group flex items-baseline gap-6 border-b border-white/8 py-6 text-white"
      >
        {parts.day ? (
          <span className="w-16 shrink-0 font-display text-[2.5rem] font-black leading-none">
            <LtrText>{parts.day}</LtrText>
          </span>
        ) : null}
        <span className="min-w-0 flex-1 font-display text-[22px] font-extrabold transition-colors group-hover:text-brand-lime">
          {title}
        </span>
      </Link>
    );
  }

  return (
    <motion.article
      className="overflow-hidden rounded-2xl bg-[#1F1D35] text-white"
      initial={reducedMotion ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.5, ease: easeOut }}
    >
      <div className="grid min-h-[420px] grid-cols-1 lg:grid-cols-12">
        {showImage ? (
          <Link
            to={`/events/${item.id}`}
            className="group relative min-h-[280px] overflow-hidden bg-[#0D0B23] lg:col-span-6 lg:min-h-full"
          >
            {item.imageUrl ? (
              <SafeImage
                src={item.imageUrl}
                alt={title}
                width={1000}
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              />
            ) : (
              <div className="flex h-full items-center justify-center px-6 text-center text-white/40">
                {title}
              </div>
            )}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1F1D35] via-[#1F1D35]/30 to-transparent lg:bg-gradient-to-l" />
          </Link>
        ) : null}

        <div
          className={`flex flex-col justify-between p-7 lg:p-10 ${
            showImage ? "lg:col-span-6" : "lg:col-span-12"
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <span
                className={`mb-3 inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide ${
                  upcoming
                    ? "bg-brand-lime/15 text-brand-lime"
                    : "border border-white/20 text-white/60"
                }`}
              >
                {upcoming ? t(UI.upcoming, locale) : t(UI.eventEnded, locale)}
              </span>
              <Link to={`/events/${item.id}`}>
                <h2 className="font-display text-[clamp(1.5rem,3vw,1.875rem)] font-bold leading-tight text-white transition-colors hover:text-brand-lime">
                  {title}
                </h2>
              </Link>
            </div>

            {parts.day ? (
              <div className="flex min-w-[90px] shrink-0 flex-col items-center justify-center bg-[#292740] px-4 py-3 text-center">
                <span className="font-display text-[46px] font-bold leading-none tracking-tight text-white">
                  <LtrText>{parts.day}</LtrText>
                </span>
                {parts.monthYear ? (
                  <span className="mt-1 text-[11px] font-medium uppercase tracking-wide text-white/55">
                    {parts.monthYear}
                  </span>
                ) : null}
                {countdownLabel ? (
                  <span className="mt-2 rounded-full bg-brand-lime/20 px-2 py-0.5 text-[10px] font-semibold text-brand-lime">
                    {countdownLabel}
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>

          {details ? (
            <p className="mt-4 line-clamp-3 text-[15px] leading-relaxed text-white/55">
              {details}
            </p>
          ) : null}

          {(location || time) && (
            <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {location ? (
                <div className="bg-[#1B1931]/70 p-3">
                  <span className="block text-[11px] font-medium tracking-wide text-white/45">
                    {t(UI.eventPlace, locale)}
                  </span>
                  <span className="mt-0.5 block text-sm font-semibold text-white">
                    {location}
                  </span>
                </div>
              ) : null}
              {time ? (
                <div className="bg-[#1B1931]/70 p-3">
                  <span className="block text-[11px] font-medium tracking-wide text-white/45">
                    {t(UI.eventTime, locale)}
                  </span>
                  <span className="mt-0.5 block text-sm font-semibold text-white">
                    <LtrText>{time}</LtrText>
                  </span>
                </div>
              ) : null}
            </div>
          )}

          <div className="mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            {waHref ? (
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full bg-brand-lime px-6 py-3 text-sm font-bold text-[#0A0820] transition-colors hover:bg-brand-lime-hover"
                onClick={(event) => event.stopPropagation()}
              >
                {t(UI.bookEventWa, locale)}
              </a>
            ) : null}
            {canAddToCalendar ? (
              <button
                type="button"
                onClick={onAddToCalendar}
                className="inline-flex items-center justify-center rounded-full bg-[#292740] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[#34324C]"
              >
                {t(UI.addToCalendar, locale)}
              </button>
            ) : (
              <Link
                to={`/events/${item.id}`}
                className="inline-flex items-center justify-center gap-1 rounded-full bg-[#292740] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[#34324C]"
              >
                <span>{t(UI.eventDetailsLink, locale)}</span>
                <span aria-hidden="true">←</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
}
