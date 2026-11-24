import React, { useCallback, useEffect, useMemo, useState } from "react";
import { IoSearchOutline, IoClose } from "react-icons/io5";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Seo from "@/components/seo/Seo";
import Loading from "@/components/loading/Loading";
import PageBanner from "@/components/ui/PageBanner";
import Reveal from "@/components/ui/Reveal";
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
  const featured =
    !queryText && currentPage === 1 && pageItems.length > 0 ? pageItems[0] : null;
  const gridItems = featured ? pageItems.slice(1) : pageItems;

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
            variant="editorial"
            eyebrow={t(contact?.companyName, locale) || hero.title}
          />

          <div className="container mx-auto px-4 py-12 lg:px-8 lg:py-16">
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
                  className="w-full rounded-xl border border-black/10 bg-white py-3.5 pe-4 ps-12 text-sm text-brand-ink outline-none transition-shadow focus:border-brand-lime focus:shadow-[0_0_0_3px_rgba(182,212,58,0.2)]"
                />
              </div>
              {queryText ? (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-black/10 px-4 py-3 text-sm font-bold text-brand-ink transition-colors hover:border-brand-lime hover:text-brand-lime"
                >
                  <IoClose className="text-lg" aria-hidden="true" />
                  {t(UI.clearFilters, locale)}
                </button>
              ) : null}
            </Reveal>

            <div className="mb-6 text-sm text-text-muted">
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
                {featured ? (
                  <Reveal className="mb-8">
                    <Link
                      to={`/articles/${featured.id}`}
                      className="group relative flex min-h-[360px] overflow-hidden rounded-[1.75rem] bg-brand-forest-deep shadow-[0_20px_50px_rgba(24,16,96,0.14)] sm:min-h-[420px]"
                    >
                      <SafeImage
                        src={featured.imageUrl}
                        alt={t(featured.title, locale)}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div
                        className="absolute inset-0 bg-gradient-to-t from-brand-forest-deep via-brand-forest-deep/45 to-transparent"
                        aria-hidden="true"
                      />
                      <div className="relative mt-auto p-6 text-white sm:p-8 lg:max-w-2xl">
                        <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-brand-lime">
                          {formatMillis(featured.createdAt, locale)}
                        </p>
                        <h2 className="mb-3 text-2xl font-extrabold leading-tight sm:text-3xl lg:text-4xl">
                          {t(featured.title, locale)}
                        </h2>
                        <p className="mb-4 line-clamp-2 text-sm leading-7 text-white/80 sm:text-base">
                          {t(featured.excerpt, locale)}
                        </p>
                        <span className="text-sm font-bold text-brand-lime">
                          {t(UI.readMore, locale)} →
                        </span>
                      </div>
                    </Link>
                  </Reveal>
                ) : null}

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
                  {gridItems.map((item, index) => (
                    <Reveal key={item.id} delay={Math.min(index * 0.04, 0.2)}>
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
