import React, { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { IoArrowBack } from "react-icons/io5";
import Seo from "@/components/seo/Seo";
import Loading from "@/components/loading/Loading";
import Reveal from "@/components/ui/Reveal";
import ArticleCard from "@/components/articles/ArticleCard";
import { EmptyState, ErrorState } from "@/components/ui/StatusMessage";
import { getArticle, getArticles } from "@/services/cms/articles";
import { useLocale } from "@/context/LocaleContext";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";
import { formatMillis } from "@/lib/time";

export default function ArticleDetails() {
  const { id } = useParams();
  const { locale } = useLocale();

  const articleQuery = useQuery({
    queryKey: ["cms", "article", id],
    queryFn: () => getArticle(id),
    enabled: Boolean(id),
  });

  const articlesQuery = useQuery({
    queryKey: ["cms", "articles"],
    queryFn: getArticles,
    staleTime: 1000 * 60 * 2,
  });

  const article = articleQuery.data;
  const title = t(article?.title, locale);
  const excerpt = t(article?.excerpt, locale);
  const content = t(article?.content, locale);

  const related = useMemo(() => {
    const list = articlesQuery.data || [];
    return list.filter((item) => item.id !== id).slice(0, 3);
  }, [articlesQuery.data, id]);

  return (
    <>
      <Seo title={title || t(UI.nav.articles, locale)} path={`/articles/${id}`} />
      {articleQuery.isPending ? <Loading /> : null}
      {!articleQuery.isPending && articleQuery.isError ? (
        <ErrorState onRetry={articleQuery.refetch} />
      ) : null}
      {!articleQuery.isPending && !articleQuery.isError && !article ? (
        <main className="pt-navbar min-h-screen bg-white">
          <EmptyState message={t(UI.missingArticle, locale)} />
        </main>
      ) : null}
      {!articleQuery.isPending && article ? (
        <main className="min-h-screen bg-white">
          <section className="relative isolate min-h-[46vh] overflow-hidden bg-brand-forest-deep text-white sm:min-h-[52vh]">
            {article.imageUrl ? (
              <img
                src={article.imageUrl}
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
                <p className="mb-3 text-sm font-bold text-brand-lime">
                  {formatMillis(article.createdAt, locale)}
                </p>
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
                to="/articles"
                className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-brand-moss transition-colors hover:text-brand-lime"
              >
                <IoArrowBack className="text-lg rtl:rotate-180" aria-hidden="true" />
                {t(UI.backToArticles, locale)}
              </Link>
              {excerpt ? (
                <p className="mb-8 text-lg leading-9 text-brand-ink/80 sm:text-xl sm:leading-10">
                  {excerpt}
                </p>
              ) : null}
              {content ? (
                <div className="whitespace-pre-wrap text-base leading-9 text-text-muted sm:text-lg sm:leading-10">
                  {content}
                </div>
              ) : null}
              {!excerpt && !content ? (
                <EmptyState message={t(UI.empty, locale)} />
              ) : null}
            </Reveal>
          </article>

          {related.length > 0 ? (
            <section className="border-t border-black/5 bg-surface-muted py-14 lg:py-16">
              <div className="container mx-auto px-4 lg:px-8">
                <Reveal className="mb-8">
                  <h2 className="text-2xl font-extrabold text-brand-ink sm:text-3xl">
                    {t(UI.relatedArticles, locale)}
                  </h2>
                </Reveal>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
                  {related.map((item, index) => (
                    <Reveal key={item.id} delay={Math.min(index * 0.05, 0.15)}>
                      <ArticleCard
                        to={`/articles/${item.id}`}
                        imageUrl={item.imageUrl}
                        title={t(item.title, locale)}
                        body={t(item.excerpt, locale)}
                        meta={formatMillis(item.createdAt, locale)}
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
