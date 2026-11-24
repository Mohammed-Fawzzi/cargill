import React, { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { IoArrowBack } from "react-icons/io5";
import Seo from "@/components/seo/Seo";
import Loading from "@/components/loading/Loading";
import Reveal from "@/components/ui/Reveal";
import EventCard from "@/components/events/EventCard";
import { EmptyState, ErrorState } from "@/components/ui/StatusMessage";
import { getEvent, getEvents } from "@/services/cms/events";
import { useLocale } from "@/context/LocaleContext";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";
import { formatDay } from "@/lib/time";

export default function EventDetails() {
  const { id } = useParams();
  const { locale } = useLocale();

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
  const isEnded = event?.status === "ended";

  const related = useMemo(() => {
    const list = eventsQuery.data || [];
    return list.filter((item) => item.id !== id).slice(0, 3);
  }, [eventsQuery.data, id]);

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
        <main className="min-h-screen bg-white">
          <section className="relative isolate min-h-[46vh] overflow-hidden bg-brand-forest-deep text-white sm:min-h-[52vh]">
            {event.imageUrl ? (
              <img
                src={event.imageUrl}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                aria-hidden="true"
              />
            ) : null}
            <div
              className="absolute inset-0 bg-gradient-to-t from-brand-forest-deep via-brand-forest-deep/80 to-brand-black/40"
              aria-hidden="true"
            />
            <div className="relative container mx-auto flex min-h-[inherit] items-end px-4 pb-12 pt-[calc(var(--navbar-height)+3rem)] lg:px-8 lg:pb-16">
              <Reveal className="max-w-3xl">
                <div className="mb-4 flex flex-wrap items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      isEnded
                        ? "bg-white/15 text-white"
                        : "bg-brand-lime text-brand-black"
                    }`}
                  >
                    {isEnded ? t(UI.ended, locale) : t(UI.upcoming, locale)}
                  </span>
                  {formatDay(event.date, locale) ? (
                    <p className="text-sm font-bold text-brand-lime">
                      {formatDay(event.date, locale)}
                    </p>
                  ) : null}
                </div>
                {title ? (
                  <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                    {title}
                  </h1>
                ) : null}
              </Reveal>
            </div>
          </section>

          <article className="container mx-auto max-w-3xl px-4 py-12 lg:px-8 lg:py-16">
            <Reveal>
              <Link
                to="/events"
                className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-brand-moss transition-colors hover:text-brand-lime"
              >
                <IoArrowBack className="text-lg rtl:rotate-180" aria-hidden="true" />
                {t(UI.backToEvents, locale)}
              </Link>
              {details ? (
                <div className="whitespace-pre-wrap text-base leading-9 text-text-muted sm:text-lg sm:leading-10">
                  {details}
                </div>
              ) : (
                <EmptyState message={t(UI.empty, locale)} />
              )}
            </Reveal>
          </article>

          {related.length > 0 ? (
            <section className="border-t border-black/5 bg-surface-muted py-14 lg:py-16">
              <div className="container mx-auto px-4 lg:px-8">
                <Reveal className="mb-8">
                  <h2 className="text-2xl font-extrabold text-brand-ink sm:text-3xl">
                    {t(UI.relatedEvents, locale)}
                  </h2>
                </Reveal>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
                  {related.map((item, index) => (
                    <Reveal key={item.id} delay={Math.min(index * 0.05, 0.15)}>
                      <EventCard
                        to={`/events/${item.id}`}
                        imageUrl={item.imageUrl}
                        title={t(item.title, locale)}
                        body={t(item.details, locale)}
                        date={formatDay(item.date, locale)}
                        status={item.status}
                      />
                    </Reveal>
                  ))}
                </div>
              </div>
            </section>
          ) : null}
        </main>
      ) : null}
    </>
  );
}
