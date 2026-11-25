import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Seo from "@/components/seo/Seo";
import Loading from "@/components/loading/Loading";
import SafeImage from "@/components/ui/SafeImage";
import RevealHeading from "@/components/ui/RevealHeading";
import LtrText from "@/components/ui/LtrText";
import EventAgendaRow, { getEventParts } from "@/components/events/EventAgendaRow";
import GrowTogetherBanner from "@/components/shared/GrowTogetherBanner";
import SplitArrowButton from "@/components/ui/SplitArrowButton";
import { EmptyState, ErrorState } from "@/components/ui/StatusMessage";
import { getEvent, getEvents } from "@/services/cms/events";
import { useLocale } from "@/context/LocaleContext";
import { useSiteData } from "@/context/SiteDataContext";
import { toWhatsAppHref } from "@/lib/phone";
import { toMapEmbedSrc, toMapLink } from "@/lib/map";
import { downloadEventIcs, hasEventTime } from "@/lib/ics";
import { eventDayKey, formatDay } from "@/lib/time";
import { easeOut } from "@/lib/motion";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";
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

function EventLightbox({ images, index, onClose, onPrev, onNext, title }) {
  const { reducedMotion } = useMotionPrefs();

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") onNext();
      if (event.key === "ArrowRight") onPrev();
    };
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose, onNext, onPrev]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A0820]/95 p-4"
      initial={reducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute end-4 top-4 text-sm font-bold text-white"
      >
        Esc
      </button>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onPrev();
        }}
        className="absolute start-3 top-1/2 -translate-y-1/2 px-3 text-3xl leading-none text-white/80"
        aria-label="Previous"
      >
        ‹
      </button>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onNext();
        }}
        className="absolute end-3 top-1/2 -translate-y-1/2 px-3 text-3xl leading-none text-white/80"
        aria-label="Next"
      >
        ›
      </button>
      <div
        className="max-h-[85vh] max-w-5xl"
        onClick={(event) => event.stopPropagation()}
      >
        <SafeImage
          src={images[index]}
          alt={title}
          className="max-h-[85vh] w-full object-contain"
        />
      </div>
    </motion.div>
  );
}

export default function EventDetails() {
  const { id } = useParams();
  const { locale } = useLocale();
  const { contact } = useSiteData();
  const { reducedMotion } = useMotionPrefs();
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const eventQuery = useQuery({
    queryKey: ["cms", "event", id],
    queryFn: () => getEvent(id),
    enabled: Boolean(id),
  });

  const eventsQuery = useQuery({
    queryKey: ["cms", "events"],
    queryFn: getEvents,
    staleTime: 1000 * 60 * 2,
  });

  const event = eventQuery.data;
  const title = t(event?.title, locale);
  const details = t(event?.details, locale);
  const location = t(event?.location, locale);
  const time = String(event?.time || "").trim();
  const isEnded = event?.status === "ended";
  const dateLabel = formatDay(event?.date, locale);
  const parts = getEventParts(event?.date, locale);
  const remaining = daysUntil(event?.date);
  const countdownLabel =
    !isEnded && remaining != null && remaining > 0
      ? remaining === 1
        ? t(UI.dayLeft, locale)
        : t(UI.daysLeft, locale).replace("{n}", String(remaining))
      : "";
  const statusLabel = isEnded
    ? t(UI.eventEnded, locale)
    : t(UI.upcoming, locale);

  const images = useMemo(() => {
    const gallery = Array.isArray(event?.images)
      ? event.images.filter(Boolean)
      : [];
    if (gallery.length) return gallery;
    return event?.imageUrl ? [event.imageUrl] : [];
  }, [event]);

  const mapQuery = event?.mapUrl || location;
  const mapSrc = toMapEmbedSrc(mapQuery);
  const mapLink = toMapLink(mapQuery);
  const canAddToCalendar = hasEventTime(time) && eventDayKey(event?.date);

  const related = useMemo(() => {
    const list = (eventsQuery.data || []).filter((item) => item.id !== id);
    const upcoming = list
      .filter((item) => item.status === "upcoming")
      .sort((a, b) => eventDayKey(a.date).localeCompare(eventDayKey(b.date)));
    const past = list
      .filter((item) => item.status === "ended")
      .sort((a, b) => eventDayKey(b.date).localeCompare(eventDayKey(a.date)));
    return [...upcoming, ...past].slice(0, 3);
  }, [eventsQuery.data, id]);

  const phone = contact?.phones?.[0] || "";
  const waHref = toWhatsAppHref(
    phone,
    t(UI.bookEventMessage, locale)
      .replace("{title}", title || "")
      .replace("{date}", dateLabel || ""),
  );

  const onAddToCalendar = () => {
    downloadEventIcs(
      {
        title,
        date: event?.date,
        time,
        location,
        description: details,
        url: typeof window !== "undefined" ? window.location.href : "",
      },
      `${eventDayKey(event?.date) || "event"}.ics`,
    );
  };

  return (
    <>
      <Seo title={title || t(UI.nav.events, locale)} path={`/events/${id}`} />
      {eventQuery.isPending ? <Loading /> : null}
      {!eventQuery.isPending && eventQuery.isError ? (
        <ErrorState onRetry={eventQuery.refetch} />
      ) : null}
      {!eventQuery.isPending && !eventQuery.isError && !event ? (
        <main className="pt-navbar min-h-screen bg-[#0A0820]">
          <EmptyState message={t(UI.missingEvent, locale)} />
        </main>
      ) : null}
      {!eventQuery.isPending && event ? (
        <main
          className={`min-h-screen bg-[#0A0820] text-white ${
            !isEnded ? "pb-28 md:pb-0" : ""
          }`}
        >
          <div className="mx-auto max-w-6xl px-4 pb-6 pt-[calc(var(--navbar-height)+var(--ticker-height)+2rem)] sm:px-6">
            <nav className="mb-6 text-sm text-white/45">
              <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <li>
                  <Link
                    to="/"
                    className="transition-colors hover:text-brand-lime"
                  >
                    {t(UI.nav.home, locale)}
                  </Link>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-white/25" aria-hidden="true">
                    /
                  </span>
                  <Link
                    to="/events"
                    className="transition-colors hover:text-brand-lime"
                  >
                    {t(UI.nav.events, locale)}
                  </Link>
                </li>
                {title ? (
                  <li className="flex items-center gap-2">
                    <span className="text-white/25" aria-hidden="true">
                      /
                    </span>
                    <span className="text-white/80">{title}</span>
                  </li>
                ) : null}
              </ol>
            </nav>

            <motion.article
              className="overflow-hidden rounded-2xl bg-[#1F1D35]"
              initial={reducedMotion ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: easeOut }}
            >
              <div className="grid min-h-[420px] grid-cols-1 lg:grid-cols-12">
                <div className="relative min-h-[280px] overflow-hidden bg-[#0D0B23] lg:col-span-6 lg:min-h-full">
                  {images[0] ? (
                    <SafeImage
                      src={images[0]}
                      alt={title}
                      width={1000}
                      className="h-full w-full object-cover sm:min-h-[380px]"
                    />
                  ) : (
                    <div className="flex h-full min-h-[280px] items-center justify-center px-6 text-center text-white/40">
                      {title}
                    </div>
                  )}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1F1D35] via-[#1F1D35]/30 to-transparent lg:bg-gradient-to-l" />
                </div>

                <div className="flex flex-col justify-between p-7 lg:col-span-6 lg:p-10">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <span
                        className={`mb-3 inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide ${
                          isEnded
                            ? "border border-white/20 text-white/60"
                            : "bg-brand-lime/15 text-brand-lime"
                        }`}
                      >
                        {statusLabel}
                      </span>
                      {title ? (
                        <RevealHeading
                          as="h1"
                          text={title}
                          className="font-display text-[clamp(1.6rem,3.5vw,2.25rem)] font-bold leading-tight text-white"
                        />
                      ) : null}
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
                    <p className="mt-4 line-clamp-4 text-[15px] leading-relaxed text-white/55">
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

                  {!isEnded ? (
                    <div className="mt-6 hidden flex-col items-stretch gap-3 sm:flex-row sm:items-center md:flex">
                      {waHref ? (
                        <a
                          href={waHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center rounded-full bg-brand-lime px-6 py-3 text-sm font-bold text-[#0A0820] transition-colors hover:bg-brand-lime-hover"
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
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>
            </motion.article>
          </div>

          <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
            {details ? (
              <motion.div
                className="mx-auto max-w-[720px] whitespace-pre-wrap text-[18px] leading-[1.9] text-white/80"
                initial={reducedMotion ? false : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.12 }}
                transition={{ duration: 0.5, ease: easeOut }}
              >
                {details}
              </motion.div>
            ) : null}

            {location && mapSrc ? (
              <motion.div
                className="mx-auto mt-12 max-w-[720px]"
                initial={reducedMotion ? false : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.5, ease: easeOut }}
              >
                <iframe
                  title={location}
                  src={mapSrc}
                  className="h-[320px] w-full border-0 grayscale"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                {mapLink ? (
                  <a
                    href={mapLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex border-b border-brand-lime pb-0.5 text-white transition-colors hover:text-brand-lime"
                  >
                    {t(UI.openInMapsLink, locale)}
                  </a>
                ) : null}
              </motion.div>
            ) : null}

            {isEnded && images.length > 1 ? (
              <div className="mx-auto mt-14 max-w-5xl">
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
                  {images.map((src, index) => (
                    <button
                      key={`${src}-${index}`}
                      type="button"
                      onClick={() => setLightboxIndex(index)}
                      className={`overflow-hidden bg-[#110E33] ${
                        index === 0 ? "col-span-2 row-span-2 md:col-span-2" : ""
                      }`}
                    >
                      <SafeImage
                        src={src}
                        alt=""
                        className={`w-full object-cover ${
                          index === 0 ? "aspect-[4/3] h-full" : "aspect-square"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {related.length > 0 ? (
            <section className="mx-auto max-w-6xl px-4 pb-10 sm:px-6">
              <div className="mb-5 flex items-center gap-4">
                <h2 className="font-display text-[22px] font-semibold text-white">
                  {t(UI.relatedEvents, locale)}
                </h2>
                <span className="h-px flex-1 bg-white/12" aria-hidden="true" />
              </div>
              <div className="space-y-6">
                {related.map((item) => (
                  <EventAgendaRow key={item.id} item={item} />
                ))}
              </div>
            </section>
          ) : null}

          <GrowTogetherBanner />

          {!isEnded && waHref ? (
            <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-[#0A0820] p-3 md:hidden">
              <SplitArrowButton
                href={waHref}
                variant="primary"
                className="w-full"
              >
                {t(UI.bookEventWa, locale)}
              </SplitArrowButton>
            </div>
          ) : null}

          {lightboxIndex !== null ? (
            <EventLightbox
              images={images}
              index={lightboxIndex}
              title={title}
              onClose={() => setLightboxIndex(null)}
              onPrev={() =>
                setLightboxIndex(
                  (lightboxIndex - 1 + images.length) % images.length,
                )
              }
              onNext={() =>
                setLightboxIndex((lightboxIndex + 1) % images.length)
              }
            />
          ) : null}
        </main>
      ) : null}
    </>
  );
}
