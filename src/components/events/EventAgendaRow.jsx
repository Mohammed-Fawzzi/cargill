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
  const meta = [location, time].filter(Boolean).join(" · ");
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
  const canAddToCalendar = upcoming && hasEventTime(time) && eventDayKey(item.date);

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
        className="group flex items-baseline gap-6 border-b border-white/12 py-6 text-white"
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
      className="grid grid-cols-1 items-center gap-8 border-b border-white/12 py-10 text-white md:grid-cols-[2fr_5fr_5fr] md:gap-10"
      initial={reducedMotion ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.5, ease: easeOut }}
    >
      <div>
        <span
          className={`inline-block rounded-full px-2.5 py-1 text-[12px] font-semibold ${
            upcoming
              ? "bg-brand-lime text-[#0A0820]"
              : "border border-white/25 text-white/70"
          }`}
        >
          {upcoming ? t(UI.upcoming, locale) : t(UI.eventEnded, locale)}
        </span>
        {parts.day ? (
          <div className="mt-3 font-display text-[clamp(4rem,12vw,7.5rem)] font-black leading-none">
            <LtrText>{parts.day}</LtrText>
          </div>
        ) : null}
        {parts.monthYear ? (
          <div className="mt-2 text-[16px] text-white/70">{parts.monthYear}</div>
        ) : null}
        {countdownLabel ? (
          <div className="mt-2.5 text-[14px] text-brand-lime">{countdownLabel}</div>
        ) : null}
      </div>

      <div>
        <Link to={`/events/${item.id}`}>
          <h3 className="font-display text-[clamp(1.75rem,4vw,2.5rem)] font-extrabold leading-[1.2] transition-colors hover:text-brand-lime">
            {title}
          </h3>
        </Link>
        {meta ? (
          <div className="mt-3 text-[14px] text-white/60">{meta}</div>
        ) : null}
        {details ? (
          <p className="mt-4 line-clamp-3 text-[18px] leading-[1.7] text-white/75">
            {details}
          </p>
        ) : null}
        <div className="mt-6 flex flex-wrap items-center gap-[18px]">
          {waHref ? (
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-brand-lime px-7 py-4 text-[16px] font-semibold text-[#0A0820] transition-colors hover:bg-brand-lime-hover"
              onClick={(event) => event.stopPropagation()}
            >
              {t(UI.bookEventWa, locale)}
            </a>
          ) : null}
          {canAddToCalendar ? (
            <button
              type="button"
              onClick={onAddToCalendar}
              className="border-b border-brand-lime pb-[3px] text-white transition-colors hover:text-brand-lime"
            >
              {t(UI.addToCalendar, locale)}
            </button>
          ) : (
            <Link
              to={`/events/${item.id}`}
              className="border-b border-brand-lime pb-[3px] text-white transition-colors hover:text-brand-lime"
            >
              {t(UI.eventDetailsLink, locale)} ←
            </Link>
          )}
        </div>
      </div>

      {showImage ? (
        <Link
          to={`/events/${item.id}`}
          className="group relative block h-[240px] overflow-hidden rounded-[20px] border border-white/8 bg-[#110E33] sm:h-[380px]"
        >
          {item.imageUrl ? (
            <SafeImage
              src={item.imageUrl}
              alt={title}
              width={900}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
          ) : (
            <div className="flex h-full items-center justify-center px-6 text-center text-white/40">
              {title}
            </div>
          )}
        </Link>
      ) : null}
    </motion.article>
  );
}
