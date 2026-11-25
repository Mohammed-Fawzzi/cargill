import React, { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Seo from "@/components/seo/Seo";
import Loading from "@/components/loading/Loading";
import PageBanner from "@/components/ui/PageBanner";
import EventAgendaRow from "@/components/events/EventAgendaRow";
import GrowTogetherBanner from "@/components/shared/GrowTogetherBanner";
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
import SlidingTabs from "@/components/ui/SlidingTabs";

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

  const counts = useMemo(
    () => ({
      all: events.length,
      upcoming: events.filter((item) => item.status === "upcoming").length,
      ended: events.filter((item) => item.status === "ended").length,
    }),
    [events],
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
    fallbackImage: "",
  });

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
        <main className="min-h-screen bg-transparent text-white">
          <PageBanner
            title={hero.title}
            subtitle={hero.subtitle}
            label={t(UI.nav.events, locale)}
            breadcrumbs={[
              { label: t(UI.nav.home, locale), to: "/" },
              { label: t(UI.nav.events, locale) },
            ]}
          />

          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <SlidingTabs
              rounded
              value={filter}
              onChange={setFilter}
              trackClassName="bg-[#1B1931] p-1.5"
              items={FILTERS.map(([key, label]) => ({
                id: key,
                label: t(label, locale),
                count: counts[key] || 0,
              }))}
              renderLabel={(item, active) => (
                <>
                  {item.label}
                  <span
                    className={`ms-1 text-[11px] ${
                      active ? "opacity-80" : "text-brand-lime/80"
                    }`}
                  >
                    ({item.count})
                  </span>
                </>
              )}
            />
          </div>

          <section className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6 md:py-14">
            {filtered.length === 0 ? (
              <div className="space-y-4">
                <EmptyState message={emptyMessage} />
                {filter === "upcoming" && facebook?.url ? (
                  <a
                    href={facebook.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex border-b border-brand-lime pb-0.5 text-white transition-colors hover:text-brand-lime"
                  >
                    {t(UI.followFacebook, locale)}
                  </a>
                ) : null}
              </div>
            ) : showSplit ? (
              <>
                <div className="space-y-8">
                  {upcomingItems.map((item) => (
                    <EventAgendaRow key={item.id} item={item} />
                  ))}
                </div>

                <div className="pt-4">
                  <div className="mb-5 flex items-center justify-between gap-4">
                    <h3 className="font-display text-[22px] font-semibold text-white">
                      {t(UI.pastEventsLabel, locale)}
                    </h3>
                  </div>
                  {pastItems.length > 0 ? (
                    <div className="space-y-8">
                      {pastItems.map((item) => (
                        <EventAgendaRow key={item.id} item={item} />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-start justify-between gap-4 bg-[#1B1931] p-6 md:flex-row md:items-center">
                      <p className="text-[15px] text-white/60">
                        {t(UI.noPastEvents, locale)}
                      </p>
                      {facebook?.url ? (
                        <a
                          href={facebook.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 bg-[#292740] px-4 py-2 text-sm font-semibold text-brand-lime transition-colors hover:bg-[#34324C]"
                        >
                          {t(UI.followFacebook, locale)}
                          <span aria-hidden="true">←</span>
                        </a>
                      ) : null}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="space-y-8">
                {(filter === "upcoming" ? upcomingItems : pastItems).map(
                  (item) => (
                    <EventAgendaRow key={item.id} item={item} />
                  ),
                )}
              </div>
            )}
          </section>

          <GrowTogetherBanner />
        </main>
      ) : null}
    </>
  );
}
