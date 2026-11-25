import React, { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Seo from "@/components/seo/Seo";
import Loading from "@/components/loading/Loading";
import PageBanner from "@/components/ui/PageBanner";
import Reveal from "@/components/ui/Reveal";
import FilterTabs from "@/components/ui/FilterTabs";
import EventAgendaRow from "@/components/events/EventAgendaRow";
import { EmptyState, ErrorState } from "@/components/ui/StatusMessage";
import { getEvents } from "@/services/cms/events";
import { useHomepageSection } from "@/hooks/useHomepageSection";
import { useLocale } from "@/context/LocaleContext";
import { useSiteData } from "@/context/SiteDataContext";
import { resolvePageHero } from "@/lib/pageHero";
import { eventDayKey } from "@/lib/time";
import { resolveCompanySocial } from "@/utils/social";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";

const FILTERS = [
  ["all", UI.allEvents],
  ["upcoming", UI.upcoming],
  ["ended", UI.ended],
];

function sortUpcoming(list) {
  return [...list].sort((a, b) => {
    const byDate = eventDayKey(a.date).localeCompare(eventDayKey(b.date));
    return byDate !== 0 ? byDate : (a.createdAt || 0) - (b.createdAt || 0);
  });
}

function sortPast(list) {
  return [...list].sort((a, b) => {
    const byDate = eventDayKey(b.date).localeCompare(eventDayKey(a.date));
    return byDate !== 0 ? byDate : (b.createdAt || 0) - (a.createdAt || 0);
  });
}

export default function Events() {
  const { locale } = useLocale();
  const { contact } = useSiteData();
  const sectionQuery = useHomepageSection("events");
  const [params, setParams] = useSearchParams();
  const filter = params.get("status") || "all";

  const eventsQuery = useQuery({
    queryKey: ["cms", "events"],
    queryFn: getEvents,
    staleTime: 1000 * 60 * 2,
  });

  const events = useMemo(() => eventsQuery.data || [], [eventsQuery.data]);

  const updateParams = useCallback(
    (patch) => {
      const next = new URLSearchParams(params);
      Object.entries(patch).forEach(([key, value]) => {
        const clear = !value || (key === "status" && value === "all");
        if (clear) next.delete(key);
        else next.set(key, value);
      });
      setParams(next, { replace: true });
    },
    [params, setParams],
  );

  const filtered = useMemo(() => {
    if (filter === "all") return events;
    return events.filter((item) => item.status === filter);
  }, [events, filter]);

  const upcomingItems = useMemo(
    () => sortUpcoming(filtered.filter((item) => item.status === "upcoming")),
    [filtered],
  );
  const pastItems = useMemo(
    () => sortPast(filtered.filter((item) => item.status === "ended")),
    [filtered],
  );

  const setFilter = (nextFilter) => {
    updateParams({ status: nextFilter });
  };

  const hero = resolvePageHero({
    section: sectionQuery.data,
    contact,
    locale,
    fallbackTitle: t(UI.nav.events, locale),
    fallbackSubtitle: t(UI.eventsIntro, locale),
    fallbackImage: events.find((item) => item.imageUrl)?.imageUrl || "",
  });

  const filterTabs = useMemo(
    () =>
      FILTERS.map(([key, label]) => ({
        id: key,
        label: t(label, locale),
      })),
    [locale],
  );

  const facebook = resolveCompanySocial(contact?.social).find(
    (item) => item.id === "facebook",
  );

  const emptyMessage =
    filter === "upcoming"
      ? t(UI.noUpcomingEvents, locale)
      : filter === "ended"
        ? t(UI.noPastEvents, locale)
        : t(UI.noEvents, locale);

  const pending = eventsQuery.isPending;
  const error = eventsQuery.isError;
  const showSplit = filter === "all";

  return (
    <>
      <Seo title={hero.title} description={hero.subtitle} path="/events" />
      {pending ? <Loading /> : null}
      {!pending && error ? (
        <ErrorState
          onRetry={() => {
            eventsQuery.refetch();
            sectionQuery.refetch();
          }}
        />
      ) : null}
      {!pending && !error ? (
        <main className="min-h-screen bg-page">
          <PageBanner
            title={hero.title}
            subtitle={hero.subtitle}
            imageUrl={hero.imageUrl}
            label={UI.pageLabel.events}
            breadcrumbs={[
              { label: t(UI.nav.home, locale), to: "/" },
              { label: t(UI.nav.events, locale) },
            ]}
          />

          <div className="container mx-auto px-4 pb-16 lg:px-8 lg:pb-20">
            <Reveal className="mb-10">
              <FilterTabs
                items={filterTabs}
                value={filter}
                onChange={setFilter}
                count={filtered.length}
                countLabel={t(UI.resultsCount, locale)}
              />
            </Reveal>

            {filtered.length === 0 ? (
              <div className="space-y-3">
                <EmptyState message={emptyMessage} />
                {filter === "upcoming" && facebook?.url ? (
                  <a
                    href={facebook.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex text-sm font-bold text-ink underline decoration-brand-lime decoration-2 underline-offset-6"
                  >
                    {t(UI.followFacebook, locale)}
                  </a>
                ) : null}
              </div>
            ) : showSplit ? (
              <div className="border-t border-line/15">
                {upcomingItems.map((item, index) => (
                  <Reveal key={item.id} delay={Math.min(index * 0.03, 0.15)}>
                    <EventAgendaRow item={item} />
                  </Reveal>
                ))}
                {pastItems.length > 0 ? (
                  <>
                    <div className="flex items-center gap-4 py-8">
                      <p className="shrink-0 text-xs font-bold tracking-[0.16em] text-text-muted">
                        {t(UI.pastEventsLabel, locale)}
                      </p>
                      <span
                        className="h-px flex-1 bg-brand-navy/15"
                        aria-hidden="true"
                      />
                    </div>
                    {pastItems.map((item, index) => (
                      <Reveal
                        key={item.id}
                        delay={Math.min(index * 0.03, 0.15)}
                      >
                        <EventAgendaRow item={item} />
                      </Reveal>
                    ))}
                  </>
                ) : null}
              </div>
            ) : (
              <div className="border-t border-line/15">
                {(filter === "upcoming" ? upcomingItems : pastItems).map(
                  (item, index) => (
                    <Reveal key={item.id} delay={Math.min(index * 0.03, 0.15)}>
                      <EventAgendaRow item={item} />
                    </Reveal>
                  ),
                )}
              </div>
            )}
          </div>
        </main>
      ) : null}
    </>
  );
}
