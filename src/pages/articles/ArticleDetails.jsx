import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Seo from "@/components/seo/Seo";
import Loading from "@/components/loading/Loading";
import PageBanner from "@/components/ui/PageBanner";
import Reveal from "@/components/ui/Reveal";
import ReadingProgress from "@/components/ui/ReadingProgress";
import ContentGrid, { cardLayoutForCount } from "@/components/ui/ContentGrid";
import { SecondaryButton } from "@/components/ui/AppButton";
import ArticleCard from "@/components/articles/ArticleCard";
import { EmptyState, ErrorState } from "@/components/ui/StatusMessage";
import { getArticle, getArticles } from "@/services/cms/articles";
import { useHomepageSection } from "@/hooks/useHomepageSection";
import { useLocale } from "@/context/LocaleContext";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";
import { formatMillis } from "@/lib/time";

export default function ArticleDetails() {
  const { id } = useParams();
  const { locale } = useLocale();
  const sectionQuery = useHomepageSection("articles");

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
  const relatedTitle =
    t(sectionQuery.data?.title, locale) || t(UI.relatedArticles, locale);
  const dateLabel = formatMillis(article?.createdAt, locale);

  const related = useMemo(() => {
    const list = articlesQuery.data || [];
    const selected = sectionQuery.data?.selectedIds || [];
    const byId = new Map(list.map((item) => [item.id, item]));
    const preferred = selected
      .map((itemId) => byId.get(itemId))
      .filter((item) => item && item.id !== id);
    const pool = preferred.length
      ? preferred
      : list.filter((item) => item.id !== id);
    return pool.slice(0, 3);
  }, [articlesQuery.data, sectionQuery.data?.selectedIds, id]);

  const relatedLayout = cardLayoutForCount(related.length);

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
          <ReadingProgress />
          <PageBanner
            title={title}
            imageUrl={article.imageUrl}
            label={UI.pageLabel.articles}
            meta={[t(UI.nav.articles, locale), dateLabel].filter(Boolean)}
            breadcrumbs={[
              { label: t(UI.nav.home, locale), to: "/" },
              { label: t(UI.nav.articles, locale), to: "/articles" },
              { label: title },
            ]}
          />

          <article className="container mx-auto max-w-3xl px-4 pb-16 lg:px-8 lg:pb-20">
            <Reveal>
              <SecondaryButton to="/articles" className="mb-8">
                {t(UI.backToArticles, locale)}
              </SecondaryButton>
              {excerpt ? (
                <p className="mb-8 border-s-2 border-brand-lime ps-5 text-lg leading-9 text-brand-ink/85 sm:text-xl sm:leading-10">
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
                      <ArticleCard
                        to={`/articles/${item.id}`}
                        imageUrl={item.imageUrl}
                        title={t(item.title, locale)}
                        body={t(item.excerpt, locale)}
                        meta={formatMillis(item.createdAt, locale)}
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
