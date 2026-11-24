import React, { useCallback, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Seo from "@/components/seo/Seo";
import Loading from "@/components/loading/Loading";
import PageBanner from "@/components/ui/PageBanner";
import Reveal from "@/components/ui/Reveal";
import EventCard from "@/components/events/EventCard";
import { EmptyState, ErrorState } from "@/components/ui/StatusMessage";
import { getEvents } from "@/services/cms/events";
import { useLocale } from "@/context/LocaleContext";
import { useSiteData } from "@/context/SiteDataContext";
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

  const bannerImage =
    contact?.bannerUrl ||
    events.find((item) => item.imageUrl)?.imageUrl ||
    "";

  return (
    <>
      <Seo title={t(UI.nav.events, locale)} path="/events" />
      {eventsQuery.isPending ? <Loading /> : null}
      {!eventsQuery.isPending && eventsQuery.isError ? (
        <ErrorState onRetry={eventsQuery.refetch} />
      ) : null}
      {!eventsQuery.isPending && !eventsQuery.isError ? (
        <main className="min-h-screen bg-white">
          <PageBanner
            title={t(UI.nav.events, locale)}
            subtitle={t(UI.eventsIntro, locale)}
            imageUrl={bannerImage}
            variant="immersive"
            eyebrow={t(UI.nav.events, locale)}
          />

          <div className="container mx-auto px-4 py-12 lg:px-8 lg:py-16">
            <Reveal className="mb-8">
              <div className="flex flex-wrap gap-2.5">
                {FILTERS.map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setFilter(key)}
                    className={`rounded-full px-5 py-2.5 text-sm font-bold transition-all duration-300 ${
                      filter === key
                        ? "bg-brand-forest-deep text-white shadow-[0_8px_20px_rgba(14,31,19,0.2)]"
                        : "bg-surface-muted text-brand-ink hover:bg-brand-lime hover:text-brand-ink"
                    }`}
                  >
                    {t(label, locale)}
                  </button>
                ))}
              </div>
            </Reveal>

            <div className="mb-6 text-sm text-text-muted">
              {filtered.length} {t(UI.resultsCount, locale)}
            </div>

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
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
                  {pageItems.map((item, index) => (
                    <Reveal key={item.id} delay={Math.min(index * 0.04, 0.2)}>
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

                {totalPages > 1 ? (
                  <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      disabled={currentPage <= 1}
                      onClick={() =>
                        updateParams({ page: String(currentPage - 1) })
                      }
                      className="rounded-full border border-black/10 px-5 py-2.5 text-sm font-bold text-brand-ink transition-colors hover:border-brand-lime disabled:opacity-35"
                    >
                      {t(UI.previous, locale)}
                    </button>
                    <p className="px-2 text-sm font-semibold text-brand-ink">
                      {t(UI.page, locale)} {currentPage} {t(UI.of, locale)}{" "}
                      {totalPages}
                    </p>
                    <button
                      type="button"
                      disabled={currentPage >= totalPages}
                      onClick={() =>
                        updateParams({ page: String(currentPage + 1) })
                      }
                      className="rounded-full border border-black/10 px-5 py-2.5 text-sm font-bold text-brand-ink transition-colors hover:border-brand-lime disabled:opacity-35"
                    >
                      {t(UI.next, locale)}
                    </button>
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
