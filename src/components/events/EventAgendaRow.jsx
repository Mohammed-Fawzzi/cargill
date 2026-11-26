import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import CurtainCard from "@/components/ui/CurtainCard";
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

  const statusLabel = upcoming ? t(UI.upcoming, locale) : t(UI.eventEnded, locale);
  const label = [statusLabel, dateLabel].filter(Boolean).join(" / ");

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.5, ease: easeOut }}
    >
      <CurtainCard
        titleTo={showImage ? `/events/${item.id}` : ""}
        imageUrl={showImage ? item.imageUrl : ""}
        videoUrl={showImage ? item.videoUrl || "" : ""}
        imageAlt={title}
        label={label}
        title={title}
        description={details}
        titleAs="h2"
        className="rounded-2xl"
      >

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

          <div className="relative z-[3] mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
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
      </CurtainCard>
    </motion.div>
  );
}
