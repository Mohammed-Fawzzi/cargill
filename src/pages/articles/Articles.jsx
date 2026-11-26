import React, { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Seo from "@/components/seo/Seo";
import Loading from "@/components/loading/Loading";
import SafeMedia from "@/components/ui/SafeMedia";
import PageHero from "@/components/ui/PageHero";
import ArticleCard from "@/components/articles/ArticleCard";
import DragRail from "@/components/ui/DragRail";
import GrowTogetherBanner from "@/components/shared/GrowTogetherBanner";
import SplitArrowButton from "@/components/ui/SplitArrowButton";
import { EmptyState, ErrorState } from "@/components/ui/StatusMessage";
import { getArticles } from "@/services/cms/articles";
import { useHomepageSection } from "@/hooks/useHomepageSection";
import { useLocale } from "@/context/LocaleContext";
import { useSiteData } from "@/context/SiteDataContext";
import { resolvePageHero } from "@/lib/pageHero";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";
import { formatMillis } from "@/lib/time";
import { easeOut } from "@/lib/motion";
import useMotionPrefs from "@/hooks/useMotionPrefs";

const PAGE_SIZE = 9;

function categoryKey(item, locale) {
  return t(item?.category, locale).trim();
}

export default function Articles() {
  const { locale } = useLocale();
  const { contact } = useSiteData();
  const { reducedMotion } = useMotionPrefs();
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

  const latestArticle = useMemo(() => {
    return [...articles]
      .sort(
        (a, b) =>
          (b.createdAt || 0) - (a.createdAt || 0) ||
          (b.updatedAt || 0) - (a.updatedAt || 0),
      )
      .find((item) => item.imageUrl || item.videoUrl) || null;
  }, [articles]);
  const featured = filtered[0] || null;
  const rest = featured ? filtered.slice(1) : [];
  const visibleRest = rest.slice(0, Math.max(0, visibleCount - 1));
  const hasMore = rest.length > visibleRest.length;

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
    fallbackSubtitle:
      t(UI.articlesIntro, locale) || t(UI.knowledgeBody, locale),
    fallbackImage: latestArticle?.imageUrl || "",
    fallbackVideo: latestArticle?.videoUrl || "",
    videoCandidates: articles.map((item) => item.videoUrl),
  });

  const pending = articlesQuery.isPending;
  const error = articlesQuery.isError;
  const featuredCategory =
    categoryKey(featured, locale) || t(UI.nav.articles, locale);
  const featuredDate = featured ? formatMillis(featured.createdAt, locale) : "";
  const featuredTitle = featured ? t(featured.title, locale) : "";
  const featuredExcerpt = featured ? t(featured.excerpt, locale) : "";

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
        <main className="min-h-screen bg-transparent text-white">
          <PageHero
            title={hero.title}
            description={hero.subtitle}
            imageUrl={hero.imageUrl}
            videoUrl={hero.videoUrl}
            videoUrls={hero.videoUrls}
            sideImages={articles
              .map((item) => item.imageUrl)
              .filter((src) => src && src !== hero.imageUrl)}
            size="mid"
            crumbs={[
              { label: t(UI.nav.home, locale), to: "/" },
              { label: t(UI.nav.articles, locale) },
            ]}
          />

          {categoryOptions.length > 0 ? (
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
              <div className="flex items-center gap-1 overflow-x-auto bg-[#1B1931] p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <button
                  type="button"
                  onClick={() => setCategory("")}
                  className={`whitespace-nowrap px-4 py-2 text-sm transition-colors ${!category
                      ? "bg-brand-lime font-semibold text-[#0A0820]"
                      : "font-medium text-white/55 hover:bg-[#1F1D35] hover:text-white"
                    }`}
                >
                  {t(UI.filterAll, locale)}
                </button>
                {categoryOptions.map((label) => {
                  const active = category === label;
                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setCategory(label)}
                      className={`whitespace-nowrap px-4 py-2 text-sm transition-colors ${active
                          ? "bg-brand-lime font-semibold text-[#0A0820]"
                          : "font-medium text-white/55 hover:bg-[#1F1D35] hover:text-white"
                        }`}
                    >
                      {label}
                    </button>
                  );
                })}
                <span className="ms-auto hidden shrink-0 px-3 text-[11px] text-white/45 sm:inline">
                  {filtered.length} {t(UI.resultsCount, locale)}
                </span>
              </div>
            </div>
          ) : null}

          <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14">
            {filtered.length === 0 ? (
              <EmptyState message={t(UI.noArticles, locale)} />
            ) : (
              <>
                {featured ? (
                  <motion.div
                    initial={reducedMotion ? false : { opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.12 }}
                    transition={{ duration: 0.5, ease: easeOut }}
                  >
                    <Link
                      to={`/articles/${featured.id}`}
                      className="group relative block overflow-hidden rounded-xl bg-[#1F1D35] transition-shadow duration-300"
                    >
                      <div className="grid min-h-[440px] grid-cols-1 lg:grid-cols-12">
                        <div className="curtain-frame relative min-h-[300px] overflow-hidden lg:col-span-7 lg:min-h-full">
                          {featured.imageUrl || featured.videoUrl ? (
                            <SafeMedia
                              src={featured.imageUrl}
                              videoUrl={featured.videoUrl || ""}
                              alt={featuredTitle}
                              width={1400}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full min-h-[300px] items-center justify-center bg-[#1B1931] px-6 text-center text-white/40">
                              {featuredTitle}
                            </div>
                          )}
                          {featured.imageUrl || featured.videoUrl ? (
                            <div className="curtain-card__cover">
                              <SafeMedia
                                src={featured.imageUrl}
                                videoUrl={featured.videoUrl || ""}
                                alt=""
                                width={1400}
                                className="curtain-card__photo is-cover"
                              />
                              <div className="curtain-card__shade" />
                            </div>
                          ) : null}
                        </div>

                        <div className="relative z-10 flex flex-col justify-between p-7 lg:col-span-5 lg:p-10">
                          <div className="flex flex-col gap-4">
                            <p className="flex flex-wrap items-center gap-2 text-[11px] font-medium tracking-wide">
                              <span className="rounded bg-[#292740] px-2 py-0.5 text-brand-lime">
                                {t(UI.latest, locale)}
                              </span>
                              <span className="text-white/45">·</span>
                              <span className="text-white/45">
                                {featuredCategory}
                              </span>
                              {featuredDate ? (
                                <>
                                  <span className="text-white/45">·</span>
                                  <span className="text-white/45">
                                    {featuredDate}
                                  </span>
                                </>
                              ) : null}
                            </p>
                            <h2 className="font-display text-[clamp(1.75rem,4vw,2.5rem)] font-bold leading-tight text-white">
                              {featuredTitle}
                            </h2>
                            {featuredExcerpt ? (
                              <p className="text-base leading-relaxed text-white/55 md:text-lg">
                                {featuredExcerpt}
                              </p>
                            ) : null}
                          </div>
                          <span className="ix-link pt-8 text-[22px] font-semibold text-brand-lime">
                            {t(UI.readArticle, locale)}
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ) : null}

                {visibleRest.length > 0 ? (
                  <div className="relative left-1/2 mt-10 w-screen max-w-[100vw] -translate-x-1/2 md:mt-14">
                    <DragRail
                      dots
                      trackClassName="ps-4 sm:ps-[max(1.5rem,calc((100vw-72rem)/2+1.5rem))]"
                    >
                      {visibleRest.map((item, index) => (
                        <motion.div
                          key={item.id}
                            className="w-[min(82vw,21rem)] shrink-0 snap-start self-start md:w-[22rem]"
                          initial={reducedMotion ? false : { opacity: 0, y: 22 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, amount: 0.15 }}
                          transition={{
                            duration: 0.45,
                            delay: reducedMotion
                              ? 0
                              : Math.min(index * 0.08, 0.4),
                            ease: easeOut,
                          }}
                        >
                          <ArticleCard
                            to={`/articles/${item.id}`}
                            imageUrl={item.imageUrl}
                            videoUrl={item.videoUrl || ""}
                            title={t(item.title, locale)}
                            body={t(item.excerpt, locale)}
                            meta={formatMillis(item.createdAt, locale)}
                            category={categoryKey(item, locale)}
                            index={index}
                          />
                        </motion.div>
                      ))}
                    </DragRail>
                  </div>
                ) : null}

                {hasMore ? (
                  <div className="mt-12 flex justify-center">
                    <SplitArrowButton
                      type="button"
                      variant="secondary"
                      onClick={() =>
                        setVisibleCount((count) => count + PAGE_SIZE)
                      }
                    >
                      {t(UI.showMore, locale)}
                    </SplitArrowButton>
                  </div>
                ) : null}
              </>
            )}
          </section>

          <GrowTogetherBanner />
        </main>
      ) : null}
    </>
  );
}
