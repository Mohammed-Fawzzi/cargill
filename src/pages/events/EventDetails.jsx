import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Seo from "@/components/seo/Seo";
import Loading from "@/components/loading/Loading";
import PageBanner from "@/components/ui/PageBanner";
import Reveal from "@/components/ui/Reveal";
import ContentGrid, { cardLayoutForCount } from "@/components/ui/ContentGrid";
import { SecondaryButton } from "@/components/ui/AppButton";
import EventCard from "@/components/events/EventCard";
import { EmptyState, ErrorState } from "@/components/ui/StatusMessage";
import { getEvent, getEvents } from "@/services/cms/events";
import { useHomepageSection } from "@/hooks/useHomepageSection";
import { useLocale } from "@/context/LocaleContext";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";
import { formatDay } from "@/lib/time";

export default function EventDetails() {
  const { id } = useParams();
  const { locale } = useLocale();
  const sectionQuery = useHomepageSection("events");

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
  const relatedTitle =
    t(sectionQuery.data?.title, locale) || t(UI.relatedEvents, locale);
  const dateLabel = formatDay(event?.date, locale);
  const statusLabel = isEnded
    ? t(UI.ended, locale)
    : t(UI.upcoming, locale);

  const related = useMemo(() => {
    const list = eventsQuery.data || [];
    const selected = sectionQuery.data?.selectedIds || [];
    const byId = new Map(list.map((item) => [item.id, item]));
    const preferred = selected
      .map((itemId) => byId.get(itemId))
      .filter((item) => item && item.id !== id);
    const pool = preferred.length
      ? preferred
      : list.filter((item) => item.id !== id);
    return pool.slice(0, 3);
  }, [eventsQuery.data, sectionQuery.data?.selectedIds, id]);

  const relatedLayout = cardLayoutForCount(related.length);

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
          <PageBanner
            title={title}
            imageUrl={event.imageUrl}
            label={UI.pageLabel.events}
            meta={[statusLabel, dateLabel].filter(Boolean)}
            breadcrumbs={[
              { label: t(UI.nav.home, locale), to: "/" },
              { label: t(UI.nav.events, locale), to: "/events" },
              { label: title },
            ]}
          />

          <article className="container mx-auto max-w-3xl px-4 pb-16 lg:px-8 lg:pb-20">
            <Reveal>
              <SecondaryButton to="/events" className="mb-8">
                {t(UI.backToEvents, locale)}
              </SecondaryButton>
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
            <section className="border-t border-brand-ink/10 bg-white py-14 lg:py-16">
              <div className="container mx-auto px-4 lg:px-8">
                <Reveal className="mb-8">
                  <h2 className="text-2xl font-extrabold text-brand-ink sm:text-3xl">
                    {relatedTitle}
                  </h2>
                </Reveal>
                <ContentGrid count={related.length}>
                  {related.map((item, index) => (
                    <Reveal key={item.id} delay={Math.min(index * 0.05, 0.15)}>
                      <EventCard
                        to={`/events/${item.id}`}
                        imageUrl={item.imageUrl}
                        title={t(item.title, locale)}
                        body={t(item.details, locale)}
                        date={formatDay(item.date, locale)}
                        status={item.status}
                        layout={relatedLayout}
                      />
                    </Reveal>
                  ))}
                </ContentGrid>
              </div>
            </section>
          ) : null}
        </main>
      ) : null}
    </>
  );
}
