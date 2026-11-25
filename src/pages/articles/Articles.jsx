import React, { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Seo from "@/components/seo/Seo";
import Loading from "@/components/loading/Loading";
import AccentHeading from "@/components/ui/AccentHeading";
import LogoTriangle from "@/components/ui/LogoTriangle";
import SafeImage from "@/components/ui/SafeImage";
import ArticleCard from "@/components/articles/ArticleCard";
import GrowTogetherBanner from "@/components/home/GrowTogetherBanner";
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
    fallbackSubtitle: t(UI.articlesIntro, locale) || t(UI.knowledgeBody, locale),
    fallbackImage: articles.find((item) => item.imageUrl)?.imageUrl || "",
  });

  const pending = articlesQuery.isPending;
  const error = articlesQuery.isError;
  const featuredCategory =
    categoryKey(featured, locale) || t(UI.nav.articles, locale);
  const featuredDate = featured ? formatMillis(featured.createdAt, locale) : "";

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
        <main className="min-h-screen bg-[#0A0820] text-white">
          <header className="mx-auto max-w-[1320px] px-6 pb-14 pt-[calc(var(--navbar-height)+var(--ticker-height)+3.5rem)] md:pb-[56px] md:pt-[calc(var(--navbar-height)+var(--ticker-height)+4.5rem)]">
            <div className="flex items-center gap-4 text-[14px] text-white/62">
              <nav aria-label="Breadcrumb" className="shrink-0">
                <ol className="flex flex-wrap items-center gap-x-2">
                  <li>
                    <Link to="/" className="transition-colors hover:text-brand-lime">
                      {t(UI.nav.home, locale)}
                    </Link>
                  </li>
                  <li aria-hidden="true">/</li>
                  <li>{t(UI.nav.articles, locale)}</li>
                </ol>
              </nav>
              <span className="h-px flex-1 bg-white/14" aria-hidden="true" />
            </div>

            <div className="mt-7 flex flex-wrap items-end justify-between gap-8">
              <div className="min-w-0 flex-1">
                <div className="overflow-hidden py-[0.1em]">
                  <motion.div
                    initial={reducedMotion ? false : { y: "110%" }}
                    animate={{ y: "0%" }}
                    transition={{ duration: 0.65, ease: easeOut }}
                  >
                    <AccentHeading
                      as="h1"
                      text={hero.title}
                      className="max-w-full break-words font-display text-[clamp(2.75rem,8.5vw,7.5rem)] font-black leading-[1.1] text-white"
                    />
                  </motion.div>
                </div>
                {hero.subtitle ? (
                  <p className="mt-[22px] max-w-[560px] text-[18px] leading-[1.7] text-white/72 md:text-[20px]">
                    {hero.subtitle}
                  </p>
                ) : null}
              </div>
              <div
                className="flex items-center gap-2.5 font-mono text-[13px] tracking-[3px] text-white/70"
                dir="ltr"
              >
                <LogoTriangle className="h-3 w-3.5" />
                {UI.pageLabel.articles}
              </div>
            </div>
          </header>

          {categoryOptions.length > 0 ? (
            <div className="mx-auto max-w-[1320px] px-6">
              <div className="flex flex-wrap items-center gap-x-[30px] gap-y-1 border-b border-white/12 text-[16px]">
                <button
                  type="button"
                  onClick={() => setCategory("")}
                  className={`border-b-2 py-4 transition-colors ${
                    !category
                      ? "border-brand-lime font-semibold text-white"
                      : "border-transparent text-white/65 hover:text-white"
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
                      className={`border-b-2 py-4 transition-colors ${
                        active
                          ? "border-brand-lime font-semibold text-white"
                          : "border-transparent text-white/65 hover:text-white"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
                <span className="py-4 text-[13px] text-white/55">
                  {filtered.length} {t(UI.resultsCount, locale)}
                </span>
              </div>
            </div>
          ) : null}

          <section className="mx-auto max-w-[1320px] px-6 pb-10 pt-10 md:pt-6">
            {filtered.length === 0 ? (
              <EmptyState message={t(UI.noArticles, locale)} />
            ) : (
              <>
                {featured ? (
                  <motion.article
                    className="grid grid-cols-1 items-center gap-8 border-b border-white/12 pb-16 md:grid-cols-[5fr_7fr] md:gap-12"
                    initial={reducedMotion ? false : { opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.15 }}
                    transition={{ duration: 0.5, ease: easeOut }}
                  >
                    <div className="order-2 md:order-1">
                      <div className="text-[13px]">
                        <span className="text-brand-lime">
                          {t(UI.latest, locale)} · {featuredCategory}
                        </span>
                        {featuredDate ? (
                          <span className="text-white/55"> · {featuredDate}</span>
                        ) : null}
                      </div>
                      <Link to={`/articles/${featured.id}`}>
                        <h2 className="mt-3.5 font-display text-[clamp(1.75rem,4vw,3.25rem)] font-black leading-[1.15] text-white transition-colors hover:text-brand-lime">
                          {t(featured.title, locale)}
                        </h2>
                      </Link>
                      {t(featured.excerpt, locale) ? (
                        <p className="mt-[18px] text-[19px] leading-[1.7] text-white/72">
                          {t(featured.excerpt, locale)}
                        </p>
                      ) : null}
                      <div className="mt-[26px]">
                        <Link
                          to={`/articles/${featured.id}`}
                          className="border-b border-brand-lime pb-[3px] text-white transition-colors hover:text-brand-lime"
                        >
                          {t(UI.readArticle, locale)} ←
                        </Link>
                      </div>
                    </div>
                    <Link
                      to={`/articles/${featured.id}`}
                      className="group order-1 block overflow-hidden rounded-[20px] border border-white/8 bg-[#110E33] md:order-2"
                    >
                      {featured.imageUrl ? (
                        <SafeImage
                          src={featured.imageUrl}
                          alt={t(featured.title, locale)}
                          width={1200}
                          className="h-[280px] w-full object-cover transition-transform duration-500 group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100 sm:h-[480px]"
                        />
                      ) : (
                        <div className="flex h-[280px] items-center justify-center px-6 text-center text-white/40 sm:h-[480px]">
                          {t(featured.title, locale)}
                        </div>
                      )}
                    </Link>
                  </motion.article>
                ) : null}

                {visibleRest.length > 0 ? (
                  <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2">
                    {visibleRest.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={reducedMotion ? false : { opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.15 }}
                        transition={{
                          duration: 0.45,
                          delay: Math.min(index * 0.04, 0.2),
                          ease: easeOut,
                        }}
                      >
                        <ArticleCard
                          to={`/articles/${item.id}`}
                          imageUrl={item.imageUrl}
                          title={t(item.title, locale)}
                          body={t(item.excerpt, locale)}
                          meta={formatMillis(item.createdAt, locale)}
                          category={categoryKey(item, locale)}
                        />
                      </motion.div>
                    ))}
                  </div>
                ) : null}

                {hasMore ? (
                  <div className="mt-12 flex justify-center">
                    <button
                      type="button"
                      onClick={() =>
                        setVisibleCount((count) => count + PAGE_SIZE)
                      }
                      className="rounded-lg border border-white/20 px-7 py-3 text-white transition-colors hover:border-brand-lime hover:text-brand-lime"
                    >
                      {t(UI.showMore, locale)}
                    </button>
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
