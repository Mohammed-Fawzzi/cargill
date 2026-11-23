import React from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Seo from "@/components/seo/Seo";
import Loading from "@/components/loading/Loading";
import { EmptyState, ErrorState, PageShell } from "@/components/ui/StatusMessage";
import { getArticle } from "@/services/cms/articles";
import { useLocale } from "@/context/LocaleContext";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";
import { formatMillis } from "@/lib/time";

export default function ArticleDetails() {
  const { id } = useParams();
  const { locale } = useLocale();
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["cms", "article", id],
    queryFn: () => getArticle(id),
    enabled: Boolean(id),
  });
  const title = t(data?.title, locale);

  return (
    <>
      <Seo title={title || t(UI.nav.articles, locale)} path={`/articles/${id}`} />
      {isPending ? <Loading /> : null}
      {!isPending && isError ? <ErrorState onRetry={refetch} /> : null}
      {!isPending && !isError && !data ? (
        <PageShell>
          <EmptyState message={t(UI.missingArticle, locale)} />
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
              {formatMillis(data.createdAt, locale)}
            </p>
            <h1 className="mb-6 text-3xl font-extrabold text-brand-ink">{title}</h1>
            {t(data.excerpt, locale) ? (
              <p className="mb-6 text-lg leading-8 text-text-muted">
                {t(data.excerpt, locale)}
              </p>
            ) : null}
            {t(data.content, locale) ? (
              <p className="whitespace-pre-wrap leading-8 text-text-muted">
                {t(data.content, locale)}
              </p>
            ) : null}
            <Link
              to="/articles"
              className="mt-10 inline-flex font-bold text-brand-moss hover:text-brand-lime"
            >
              {t(UI.nav.articles, locale)}
            </Link>
          </article>
        </PageShell>
      ) : null}
    </>
  );
}
