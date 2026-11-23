import React from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Seo from "@/components/seo/Seo";
import Loading from "@/components/loading/Loading";
import { EmptyState, ErrorState, PageShell } from "@/components/ui/StatusMessage";
import { getEvent } from "@/services/cms/events";
import { useLocale } from "@/context/LocaleContext";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";
import { formatDay } from "@/lib/time";

export default function EventDetails() {
  const { id } = useParams();
  const { locale } = useLocale();
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["cms", "event", id],
    queryFn: () => getEvent(id),
    enabled: Boolean(id),
  });
  const title = t(data?.title, locale);

  return (
    <>
      <Seo title={title || t(UI.nav.events, locale)} path={`/events/${id}`} />
      {isPending ? <Loading /> : null}
      {!isPending && isError ? <ErrorState onRetry={refetch} /> : null}
      {!isPending && !isError && !data ? (
        <PageShell>
          <EmptyState message={t(UI.missingEvent, locale)} />
        </PageShell>
      ) : null}
      {!isPending && data ? (
        <PageShell>
          {data.imageUrl ? (
            <div className="h-64 w-full overflow-hidden bg-brand-black sm:h-80">
              <img src={data.imageUrl} alt={title} className="h-full w-full object-cover" />
            </div>
          ) : null}
          <article className="container mx-auto max-w-3xl px-4 py-12 lg:px-8">
            <p className="mb-3 text-sm font-bold text-brand-moss">
              {formatDay(data.date, locale)}
              {" — "}
              {data.status === "ended" ? t(UI.ended, locale) : t(UI.upcoming, locale)}
            </p>
            <h1 className="mb-6 text-3xl font-extrabold text-brand-ink">{title}</h1>
            {t(data.details, locale) ? (
              <p className="whitespace-pre-wrap leading-8 text-text-muted">
                {t(data.details, locale)}
              </p>
            ) : null}
            <Link
              to="/events"
              className="mt-10 inline-flex font-bold text-brand-moss hover:text-brand-lime"
            >
              {t(UI.nav.events, locale)}
            </Link>
          </article>
        </PageShell>
      ) : null}
    </>
  );
}
