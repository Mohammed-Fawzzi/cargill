import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Seo from "@/components/seo/Seo";
import Loading from "@/components/loading/Loading";
import PageBanner from "@/components/ui/PageBanner";
import MediaCard from "@/components/ui/MediaCard";
import { EmptyState, ErrorState, PageShell } from "@/components/ui/StatusMessage";
import { getEvents } from "@/services/cms/events";
import { useLocale } from "@/context/LocaleContext";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";
import { formatDay } from "@/lib/time";

export default function Events() {
  const { locale } = useLocale();
  const [filter, setFilter] = useState("all");
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["cms", "events"],
    queryFn: getEvents,
  });

  const items = useMemo(() => {
    const list = data || [];
    if (filter === "all") return list;
    return list.filter((item) => item.status === filter);
  }, [data, filter]);

  return (
    <>
      <Seo title={t(UI.nav.events, locale)} path="/events" />
      {isPending ? <Loading /> : null}
      {!isPending && isError ? <ErrorState onRetry={refetch} /> : null}
      {!isPending && !isError ? (
        <PageShell>
          <PageBanner title={t(UI.nav.events, locale)} />
          <div className="container mx-auto px-4 py-12 lg:px-8">
            <div className="mb-8 flex flex-wrap gap-2">
              {[
                ["all", UI.allEvents],
                ["upcoming", UI.upcoming],
                ["ended", UI.ended],
              ].map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFilter(key)}
                  className={`rounded-full px-4 py-2 text-sm font-bold ${
                    filter === key
                      ? "bg-brand-black text-white"
                      : "bg-surface-muted text-brand-ink"
                  }`}
                >
                  {t(label, locale)}
                </button>
              ))}
            </div>
            {items.length === 0 ? (
              <EmptyState message={t(UI.noEvents, locale)} />
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                  <MediaCard
                    key={item.id}
                    to={`/events/${item.id}`}
                    imageUrl={item.imageUrl}
                    title={t(item.title, locale)}
                    body={t(item.details, locale)}
                    meta={formatDay(item.date, locale)}
                    badge={
                      item.status === "ended"
                        ? t(UI.ended, locale)
                        : t(UI.upcoming, locale)
                    }
                  />
                ))}
              </div>
            )}
          </div>
        </PageShell>
      ) : null}
    </>
  );
}
