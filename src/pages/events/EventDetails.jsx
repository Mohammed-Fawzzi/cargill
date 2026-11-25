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
import GrowTogetherBanner from "@/components/home/GrowTogetherBanner";
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

  const meta = [location, time].filter(Boolean).join(" · ");

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
          <section className="mx-auto grid max-w-[1320px] grid-cols-1 items-center gap-10 px-6 pb-16 pt-[calc(var(--navbar-height)+var(--ticker-height)+3.5rem)] md:grid-cols-[2fr_5fr_5fr] md:gap-10">
            <motion.div
              initial={reducedMotion ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: easeOut }}
            >
              <Link
                to="/events"
                className="text-[14px] text-brand-lime transition-colors hover:text-[#B5E06E]"
              >
                ← {t(UI.backToEvents, locale)}
              </Link>
              <span
                className={`mt-5 inline-block rounded-full px-2.5 py-1 text-[12px] font-semibold ${
                  isEnded
                    ? "border border-white/25 text-white/70"
                    : "bg-brand-lime text-[#0A0820]"
                }`}
              >
                {statusLabel}
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
                <div className="mt-2.5 text-[14px] text-brand-lime">
                  {countdownLabel}
                </div>
              ) : null}
            </motion.div>

            <motion.div
              initial={reducedMotion ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: reducedMotion ? 0 : 0.06, ease: easeOut }}
            >
              {title ? (
                <RevealHeading
                  as="h1"
                  text={title}
                  className="max-w-full break-words font-display text-[clamp(2.25rem,5.5vw,4rem)] font-extrabold leading-[1.2] text-white"
                />
              ) : null}
              {meta ? (
                <div className="mt-3 text-[14px] text-white/60">{meta}</div>
              ) : null}
              {details ? (
                <p className="mt-4 line-clamp-4 text-[18px] leading-[1.7] text-white/75">
                  {details}
                </p>
              ) : null}
              {!isEnded ? (
                <div className="mt-6 hidden flex-wrap items-center gap-[18px] md:flex">
                  {waHref ? (
                    <a
                      href={waHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg bg-brand-lime px-7 py-4 text-[16px] font-semibold text-[#0A0820] transition-colors hover:bg-brand-lime-hover"
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
                  ) : null}
                </div>
              ) : null}
            </motion.div>

            {images[0] ? (
              <motion.div
                className="overflow-hidden rounded-[20px] border border-white/8 bg-[#110E33]"
                initial={reducedMotion ? false : { opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: reducedMotion ? 0 : 0.1, ease: easeOut }}
              >
                <SafeImage
                  src={images[0]}
                  alt={title}
                  width={1000}
                  className="h-[280px] w-full object-cover sm:h-[380px]"
                />
              </motion.div>
            ) : null}
          </section>

          <div className="mx-auto max-w-[1320px] px-6 pb-16">
            {details ? (
              <motion.div
                className="mx-auto max-w-[720px] whitespace-pre-wrap text-[20px] leading-[1.95] text-white/85"
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
                  className="h-[320px] w-full rounded-[14px] border-0 grayscale"
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
                      className={`overflow-hidden rounded-[14px] border border-white/8 bg-[#110E33] ${
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
            <section className="mx-auto max-w-[1320px] px-6 pb-10">
              <div className="mb-4 flex items-center gap-4 text-[14px] text-white/70">
                <span>{t(UI.relatedEvents, locale)}</span>
                <span className="h-px flex-1 bg-white/14" aria-hidden="true" />
                <span className="font-mono text-brand-lime" dir="ltr">
                  § MORE
                </span>
              </div>
              <div className="border-t border-white/12">
                {related.map((item) => (
                  <EventAgendaRow
                    key={item.id}
                    item={item}
                    compact
                    showImage={false}
                  />
                ))}
              </div>
            </section>
          ) : null}

          <GrowTogetherBanner />

          {!isEnded && waHref ? (
            <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-[#0A0820] p-3 md:hidden">
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center rounded-lg bg-brand-lime px-6 py-3.5 text-[16px] font-semibold text-[#0A0820]"
              >
                {t(UI.bookEventWa, locale)}
              </a>
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
