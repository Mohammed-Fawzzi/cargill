import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, useReducedMotion } from "framer-motion";
import Seo from "@/components/seo/Seo";
import Loading from "@/components/loading/Loading";
import Reveal from "@/components/ui/Reveal";
import SafeImage from "@/components/ui/SafeImage";
import { PrimaryButton, SecondaryButton } from "@/components/ui/AppButton";
import EventAgendaRow from "@/components/events/EventAgendaRow";
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

function EventLightbox({ images, index, onClose, onPrev, onNext, title }) {
  const reduceMotion = useReducedMotion();

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-brand-ink/95 p-4"
      initial={reduceMotion ? false : { opacity: 0 }}
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
  const reduceMotion = useReducedMotion();
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

  const facts = [
    dateLabel ? { label: t(UI.eventDate, locale), value: dateLabel } : null,
    time ? { label: t(UI.eventTime, locale), value: time } : null,
    location ? { label: t(UI.eventPlace, locale), value: location } : null,
  ].filter(Boolean);

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
        <main className="pt-navbar min-h-screen bg-white">
          <EmptyState message={t(UI.missingEvent, locale)} />
        </main>
      ) : null}
      {!eventQuery.isPending && event ? (
        <main className={`min-h-screen bg-white ${!isEnded ? "pb-28 md:pb-0" : ""}`}>
          <header className="pt-[140px]">
            <motion.div
              className="container mx-auto px-4 lg:px-8"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.45, ease: easeOut }}
            >
              <SecondaryButton to="/events" className="mb-8">
                {t(UI.backToEvents, locale)}
              </SecondaryButton>

              <p
                className={`mb-4 text-xs font-bold tracking-[0.16em] ${
                  isEnded ? "text-text-muted" : "text-brand-lime"
                }`}
              >
                {statusLabel}
              </p>

              {title ? (
                <h1 className="max-w-[900px] text-[clamp(2.25rem,5vw,4.25rem)] font-extrabold leading-[1.05] tracking-tight text-brand-ink">
                  {title}
                </h1>
              ) : null}

              {facts.length ? (
                <dl className="mt-8 grid gap-0 border-y border-brand-ink/15 sm:grid-cols-3">
                  {facts.map((fact) => (
                    <div
                      key={fact.label}
                      className="border-b border-brand-ink/10 px-0 py-4 last:border-b-0 sm:border-b-0 sm:border-e sm:px-5 sm:first:ps-0 sm:last:border-e-0 sm:last:pe-0"
                    >
                      <dt className="mb-1 text-xs text-text-muted">
                        {fact.label}
                      </dt>
                      <dd className="text-base font-bold text-brand-ink">
                        {fact.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : null}

              {images[0] ? (
                <div className="mt-10 overflow-hidden rounded-lg bg-surface-muted">
                  <SafeImage
                    src={images[0]}
                    alt={title}
                    className="aspect-[16/9] w-full object-cover"
                  />
                </div>
              ) : null}

              {!isEnded ? (
                <div className="mt-8 hidden flex-wrap items-center gap-5 md:flex">
                  {waHref ? (
                    <PrimaryButton href={waHref}>
                      {t(UI.bookEventWa, locale)}
                    </PrimaryButton>
                  ) : null}
                  {canAddToCalendar ? (
                    <SecondaryButton onClick={onAddToCalendar}>
                      {t(UI.addToCalendar, locale)}
                    </SecondaryButton>
                  ) : null}
                </div>
              ) : null}
            </motion.div>
          </header>

          <div className="container mx-auto px-4 py-12 lg:px-8 lg:py-16">
            <Reveal>
              {details ? (
                <div className="article-body mx-auto max-w-[720px] whitespace-pre-wrap">
                  {details}
                </div>
              ) : (
                <EmptyState message={t(UI.empty, locale)} />
              )}
            </Reveal>

            {location && mapSrc ? (
              <Reveal className="mx-auto mt-12 max-w-[720px]">
                <iframe
                  title={location}
                  src={mapSrc}
                  className="h-[320px] w-full rounded-lg border-0 grayscale contrast-[1.1]"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                {mapLink ? (
                  <SecondaryButton href={mapLink} className="mt-4">
                    {t(UI.openInMapsLink, locale)}
                  </SecondaryButton>
                ) : null}
              </Reveal>
            ) : null}

            {isEnded && images.length > 1 ? (
              <Reveal className="mx-auto mt-14 max-w-5xl">
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
                  {images.map((src, index) => (
                    <button
                      key={`${src}-${index}`}
                      type="button"
                      onClick={() => setLightboxIndex(index)}
                      className={`overflow-hidden rounded-md bg-surface-muted ${
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
              </Reveal>
            ) : null}
          </div>

          {related.length > 0 ? (
            <section className="border-t border-brand-ink/10 py-14 lg:py-16">
              <div className="container mx-auto px-4 lg:px-8">
                <Reveal className="mb-6">
                  <h2 className="text-2xl font-extrabold text-brand-ink sm:text-3xl">
                    {t(UI.relatedEvents, locale)}
                  </h2>
                </Reveal>
                <div className="border-t border-brand-ink/15">
                  {related.map((item) => (
                    <EventAgendaRow
                      key={item.id}
                      item={item}
                      compact
                      showImage={false}
                    />
                  ))}
                </div>
              </div>
            </section>
          ) : null}

          {!isEnded && waHref ? (
            <div className="fixed inset-x-0 bottom-0 z-30 border-t border-brand-ink/15 bg-white p-3 md:hidden">
              <PrimaryButton href={waHref} className="w-full">
                {t(UI.bookEventWa, locale)}
              </PrimaryButton>
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
