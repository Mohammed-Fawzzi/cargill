import React, { useCallback, useEffect, useMemo, useState } from "react";
import { IoSearchOutline } from "react-icons/io5";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Seo from "@/components/seo/Seo";
import Loading from "@/components/loading/Loading";
import PageBanner from "@/components/ui/PageBanner";
import Reveal from "@/components/ui/Reveal";
import ContentGrid, { cardLayoutForCount } from "@/components/ui/ContentGrid";
import { PrimaryButton, SecondaryButton } from "@/components/ui/AppButton";
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

export default function Articles() {
  const { locale } = useLocale();
  const { contact } = useSiteData();
  const sectionQuery = useHomepageSection("articles");
  const [params, setParams] = useSearchParams();
  const queryText = params.get("q") || "";
  const pageParam = Number(params.get("page") || "1");
  const [searchInput, setSearchInput] = useState(queryText);

  const articlesQuery = useQuery({
    queryKey: ["cms", "articles"],
    queryFn: getArticles,
    staleTime: 1000 * 60 * 2,
  });

  const articles = useMemo(
    () => articlesQuery.data || [],
    [articlesQuery.data],
  );

  const updateParams = useCallback(
    (patch) => {
      const next = new URLSearchParams(params);
      Object.entries(patch).forEach(([key, value]) => {
        if (!value) next.delete(key);
        else next.set(key, value);
      });
      setParams(next, { replace: true });
    },
    [params, setParams],
  );

  useEffect(() => {
    setSearchInput(queryText);
  }, [queryText]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const next = searchInput.trim();
      if (next === queryText) return;
      updateParams({ q: next, page: "1" });
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchInput, queryText, updateParams]);

  const filtered = useMemo(() => {
    const needle = queryText.trim().toLowerCase();
    if (!needle) return articles;
    return articles.filter((item) => {
      const titleAr = String(item.title?.ar || "").toLowerCase();
      const titleEn = String(item.title?.en || "").toLowerCase();
      const excerptAr = String(item.excerpt?.ar || "").toLowerCase();
      const excerptEn = String(item.excerpt?.en || "").toLowerCase();
      return (
        titleAr.includes(needle) ||
        titleEn.includes(needle) ||
        excerptAr.includes(needle) ||
        excerptEn.includes(needle)
      );
    });
  }, [articles, queryText]);

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

  const clearFilters = () => {
    setSearchInput("");
    setParams(new URLSearchParams(), { replace: true });
  };

  const fallbackImage =
    articles.find((item) => item.imageUrl)?.imageUrl || "";
  const hero = resolvePageHero({
    section: sectionQuery.data,
    contact,
    locale,
    fallbackTitle: t(UI.nav.articles, locale),
    fallbackSubtitle: t(UI.articlesIntro, locale),
    fallbackImage,
  });

  const cardLayout = cardLayoutForCount(pageItems.length);
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
        <main className="min-h-screen bg-white">
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
            <Reveal className="mb-8 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="relative">
                <IoSearchOutline
                  className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-xl text-brand-ink/40"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder={t(UI.searchArticles, locale)}
                  className="w-full rounded-md border border-brand-ink/15 bg-white py-3.5 pe-4 ps-12 text-sm text-brand-ink outline-none transition-colors focus:border-brand-lime"
                />
              </div>
              {queryText ? (
                <SecondaryButton onClick={clearFilters}>
                  {t(UI.clearFilters, locale)}
                </SecondaryButton>
              ) : null}
            </Reveal>

            <div className="mb-8 border-b border-brand-ink/15 pb-3 text-xs text-text-muted">
              {filtered.length} {t(UI.resultsCount, locale)}
            </div>

            {filtered.length === 0 ? (
              <EmptyState
                message={
                  queryText
                    ? t(UI.noSearchArticles, locale)
                    : t(UI.noArticles, locale)
                }
              />
            ) : (
              <>
                <ContentGrid count={pageItems.length}>
                  {pageItems.map((item, index) => (
                    <Reveal key={item.id} delay={Math.min(index * 0.04, 0.2)}>
                      <ArticleCard
                        to={`/articles/${item.id}`}
                        imageUrl={item.imageUrl}
                        title={t(item.title, locale)}
                        body={t(item.excerpt, locale)}
                        meta={formatMillis(item.createdAt, locale)}
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
