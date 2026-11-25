import React, { useCallback, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Seo from "@/components/seo/Seo";
import Loading from "@/components/loading/Loading";
import PageBanner from "@/components/ui/PageBanner";
import Reveal from "@/components/ui/Reveal";
import FilterTabs from "@/components/ui/FilterTabs";
import ContentGrid, { cardLayoutForCount } from "@/components/ui/ContentGrid";
import { PrimaryButton, SecondaryButton } from "@/components/ui/AppButton";
import EventCard from "@/components/events/EventCard";
import { EmptyState, ErrorState } from "@/components/ui/StatusMessage";
import { getEvents } from "@/services/cms/events";
import { useHomepageSection } from "@/hooks/useHomepageSection";
import { useLocale } from "@/context/LocaleContext";
import { useSiteData } from "@/context/SiteDataContext";
import { resolvePageHero } from "@/lib/pageHero";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";
import { formatDay } from "@/lib/time";

const PAGE_SIZE = 9;
const FILTERS = [
  ["all", UI.allEvents],
  ["upcoming", UI.upcoming],
  ["ended", UI.ended],
];

export default function Events() {
  const { locale } = useLocale();
  const { contact } = useSiteData();
  const sectionQuery = useHomepageSection("events");
  const [params, setParams] = useSearchParams();
  const filter = params.get("status") || "all";
  const pageParam = Number(params.get("page") || "1");

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
        const clear =
          !value ||
          (key === "status" && value === "all") ||
          (key === "page" && value === "1");
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

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(Math.max(1, pageParam || 1), totalPages);
  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  useEffect(() => {
    if (pageParam !== currentPage) {
      updateParams({ page: String(currentPage) });
    }
  }, [pageParam, currentPage, updateParams]);

  const setFilter = (nextFilter) => {
    updateParams({ status: nextFilter, page: "1" });
  };

  const fallbackImage =
    events.find((item) => item.imageUrl)?.imageUrl || "";
  const hero = resolvePageHero({
    section: sectionQuery.data,
    contact,
    locale,
    fallbackTitle: t(UI.nav.events, locale),
    fallbackSubtitle: t(UI.eventsIntro, locale),
    fallbackImage,
  });

  const filterTabs = useMemo(
    () =>
      FILTERS.map(([key, label]) => ({
        id: key,
        label: t(label, locale),
      })),
    [locale],
  );

  const cardLayout = cardLayoutForCount(pageItems.length);
  const pending = eventsQuery.isPending;
  const error = eventsQuery.isError;

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
        <main className="min-h-screen bg-white">
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
              <EmptyState
                message={
                  filter === "all"
                    ? t(UI.noEvents, locale)
                    : t(UI.noFilteredEvents, locale)
                }
              />
            ) : (
              <>
                <ContentGrid count={pageItems.length}>
                  {pageItems.map((item, index) => (
                    <Reveal key={item.id} delay={Math.min(index * 0.04, 0.2)}>
                      <EventCard
                        to={`/events/${item.id}`}
                        imageUrl={item.imageUrl}
                        title={t(item.title, locale)}
                        body={t(item.details, locale)}
                        date={formatDay(item.date, locale)}
                        status={item.status}
                        layout={cardLayout}
                      />
                    </Reveal>
                  ))}
                </ContentGrid>

                {totalPages > 1 ? (
                  <div className="mt-12 flex flex-wrap items-center justify-center gap-6">
                    <SecondaryButton
                      disabled={currentPage <= 1}
                      onClick={() =>
                        updateParams({ page: String(currentPage - 1) })
                      }
                    >
                      {t(UI.previous, locale)}
                    </SecondaryButton>
                    <p className="text-sm text-text-muted">
                      {t(UI.page, locale)} {currentPage} {t(UI.of, locale)}{" "}
                      {totalPages}
                    </p>
                    <PrimaryButton
                      disabled={currentPage >= totalPages}
                      onClick={() =>
                        updateParams({ page: String(currentPage + 1) })
                      }
                    >
                      {t(UI.next, locale)}
                    </PrimaryButton>
                  </div>
                ) : null}
              </>
            )}
          </div>
        </main>
      ) : null}
    </>
  );
}
