import React, { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Seo from "@/components/seo/Seo";
import Loading from "@/components/loading/Loading";
import PageBanner from "@/components/ui/PageBanner";
import Reveal from "@/components/ui/Reveal";
import FilterTabs from "@/components/ui/FilterTabs";
import ContentGrid, { cardLayoutForCount } from "@/components/ui/ContentGrid";
import { SecondaryButton } from "@/components/ui/AppButton";
import SafeImage from "@/components/ui/SafeImage";
import ArticleCard from "@/components/articles/ArticleCard";
import { EmptyState, ErrorState } from "@/components/ui/StatusMessage";
import { getArticles } from "@/services/cms/articles";
import { useHomepageSection } from "@/hooks/useHomepageSection";
import { useLocale } from "@/context/LocaleContext";
import { useSiteData } from "@/context/SiteDataContext";
import { resolvePageHero } from "@/lib/pageHero";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";
import { formatMillis } from "@/lib/time";

const PAGE_SIZE = 9;

function categoryKey(item, locale) {
  return t(item?.category, locale).trim();
}

export default function Articles() {
  const { locale } = useLocale();
  const { contact } = useSiteData();
  const sectionQuery = useHomepageSection("articles");
  const [params, setParams] = useSearchParams();
  const category = params.get("category") || "";
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const articlesQuery = useQuery({
    queryKey: ["cms", "articles"],
    queryFn: getArticles,
    staleTime: 1000 * 60 * 2,
  });

  const articles = useMemo(
    () => articlesQuery.data || [],
    [articlesQuery.data],
  );

  const categoryOptions = useMemo(() => {
    const seen = new Map();
    for (const item of articles) {
      const label = categoryKey(item, locale);
      if (!label) continue;
      if (!seen.has(label)) seen.set(label, label);
    }
    return [...seen.values()];
  }, [articles, locale]);

  const filtered = useMemo(() => {
    if (!category) return articles;
    return articles.filter((item) => categoryKey(item, locale) === category);
  }, [articles, category, locale]);

  const featured = filtered[0] || null;
  const rest = featured ? filtered.slice(1) : [];
  const visibleRest = rest.slice(0, Math.max(0, visibleCount - 1));
  const hasMore = rest.length > visibleRest.length;
  const cardLayout = cardLayoutForCount(visibleRest.length);

  const setCategory = (next) => {
    const nextParams = new URLSearchParams(params);
    if (!next) nextParams.delete("category");
    else nextParams.set("category", next);
    setParams(nextParams, { replace: true });
    setVisibleCount(PAGE_SIZE);
  };

  const hero = resolvePageHero({
    section: sectionQuery.data,
    contact,
    locale,
    fallbackTitle: t(UI.knowledgeTitle, locale),
    fallbackSubtitle: t(UI.articlesIntro, locale),
    fallbackImage: articles.find((item) => item.imageUrl)?.imageUrl || "",
  });

  const tabs = useMemo(
    () => [
      { id: "", label: t(UI.filterAll, locale) },
      ...categoryOptions.map((label) => ({ id: label, label })),
    ],
    [categoryOptions, locale],
  );

  const pending = articlesQuery.isPending;
  const error = articlesQuery.isError;

  return (
    <>
      <Seo title={hero.title} description={hero.subtitle} path="/articles" />
      {pending ? <Loading /> : null}
      {!pending && error ? (
        <ErrorState
          onRetry={() => {
            articlesQuery.refetch();
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
            label={UI.pageLabel.articles}
            breadcrumbs={[
              { label: t(UI.nav.home, locale), to: "/" },
              { label: t(UI.nav.articles, locale) },
            ]}
          />

          <div className="container mx-auto px-4 pb-16 lg:px-8 lg:pb-20">
            {categoryOptions.length > 0 ? (
              <div className="mb-10">
                <FilterTabs
                  items={tabs}
                  value={category}
                  onChange={setCategory}
                  count={filtered.length}
                  countLabel={t(UI.resultsCount, locale)}
                />
              </div>
            ) : (
              <div className="mb-8 border-b border-line/15 pb-3 text-xs text-text-muted">
                {filtered.length} {t(UI.resultsCount, locale)}
              </div>
            )}

            {filtered.length === 0 ? (
              <EmptyState message={t(UI.noArticles, locale)} />
            ) : (
              <>
                {featured ? (
                  <Reveal className="mb-14 lg:mb-16">
                    <article className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-10">
                      <div className="order-2 lg:order-1 lg:col-span-5">
                        <p className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                          <span className="font-semibold text-brand-lime">
                            {categoryKey(featured, locale) ||
                              t(UI.nav.articles, locale)}
                          </span>
                          {formatMillis(featured.createdAt, locale) ? (
                            <>
                              <span
                                className="text-ink/25"
                                aria-hidden="true"
                              >
                                ·
                              </span>
                              <span className="text-text-muted">
                                {formatMillis(featured.createdAt, locale)}
                              </span>
                            </>
                          ) : null}
                        </p>
                        <h2 className="mb-4 text-[clamp(1.75rem,3.5vw,2.5rem)] font-extrabold leading-tight tracking-tight text-ink">
                          {t(featured.title, locale)}
                        </h2>
                        {t(featured.excerpt, locale) ? (
                          <p className="mb-6 line-clamp-3 text-base leading-8 text-text-muted">
                            {t(featured.excerpt, locale)}
                          </p>
                        ) : null}
                        <SecondaryButton to={`/articles/${featured.id}`}>
                          {t(UI.readArticle, locale)}
                        </SecondaryButton>
                      </div>
                      <div className="order-1 lg:order-2 lg:col-span-7">
                        <Link
                          to={`/articles/${featured.id}`}
                          className="block overflow-hidden rounded-lg bg-surface-muted"
                        >
                          {featured.imageUrl ? (
                            <SafeImage
                              src={featured.imageUrl}
                              alt={t(featured.title, locale)}
                              className="aspect-[16/10] w-full object-cover transition-transform duration-500 hover:scale-[1.02] motion-reduce:transition-none motion-reduce:hover:scale-100"
                            />
                          ) : (
                            <div className="flex aspect-[16/10] items-center justify-center px-6 text-center text-ink/40">
                              {t(featured.title, locale)}
                            </div>
                          )}
                        </Link>
                      </div>
                    </article>
                  </Reveal>
                ) : null}

                {visibleRest.length > 0 ? (
                  <ContentGrid count={visibleRest.length}>
                    {visibleRest.map((item, index) => (
                      <Reveal key={item.id} delay={Math.min(index * 0.04, 0.2)}>
                        <ArticleCard
                          to={`/articles/${item.id}`}
                          imageUrl={item.imageUrl}
                          title={t(item.title, locale)}
                          body={t(item.excerpt, locale)}
                          meta={formatMillis(item.createdAt, locale)}
                          category={categoryKey(item, locale)}
                          layout={cardLayout}
                        />
                      </Reveal>
                    ))}
                  </ContentGrid>
                ) : null}

                {hasMore ? (
                  <div className="mt-12 flex justify-center">
                    <SecondaryButton
                      onClick={() =>
                        setVisibleCount((count) => count + PAGE_SIZE)
                      }
                    >
                      {t(UI.showMore, locale)}
                    </SecondaryButton>
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
