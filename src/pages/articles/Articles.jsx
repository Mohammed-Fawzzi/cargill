import React from "react";
import { useQuery } from "@tanstack/react-query";
import Seo from "@/components/seo/Seo";
import Loading from "@/components/loading/Loading";
import PageBanner from "@/components/ui/PageBanner";
import MediaCard from "@/components/ui/MediaCard";
import { EmptyState, ErrorState, PageShell } from "@/components/ui/StatusMessage";
import { getArticles } from "@/services/cms/articles";
import { useLocale } from "@/context/LocaleContext";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";
import { formatMillis } from "@/lib/time";

export default function Articles() {
  const { locale } = useLocale();
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["cms", "articles"],
    queryFn: getArticles,
  });
  const items = data || [];

  return (
    <>
      <Seo title={t(UI.nav.articles, locale)} path="/articles" />
      {isPending ? <Loading /> : null}
      {!isPending && isError ? <ErrorState onRetry={refetch} /> : null}
      {!isPending && !isError ? (
        <PageShell>
          <PageBanner title={t(UI.nav.articles, locale)} />
          <div className="container mx-auto px-4 py-12 lg:px-8">
            {items.length === 0 ? (
              <EmptyState message={t(UI.noArticles, locale)} />
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                  <MediaCard
                    key={item.id}
                    to={`/articles/${item.id}`}
                    imageUrl={item.imageUrl}
                    title={t(item.title, locale)}
                    body={t(item.excerpt, locale)}
                    meta={formatMillis(item.createdAt, locale)}
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
