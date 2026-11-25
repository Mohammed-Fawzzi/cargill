import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Seo from "@/components/seo/Seo";
import Loading from "@/components/loading/Loading";
import ReadingProgress from "@/components/ui/ReadingProgress";
import SafeImage from "@/components/ui/SafeImage";
import RevealHeading from "@/components/ui/RevealHeading";
import ArticleCard from "@/components/articles/ArticleCard";
import GrowTogetherBanner from "@/components/shared/GrowTogetherBanner";
import { EmptyState, ErrorState } from "@/components/ui/StatusMessage";
import { getArticle, getArticles } from "@/services/cms/articles";
import { useLocale } from "@/context/LocaleContext";
import { useSiteData } from "@/context/SiteDataContext";
import { toWhatsAppHref } from "@/lib/phone";
import { easeOut } from "@/lib/motion";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";
import { formatMillis } from "@/lib/time";
import useMotionPrefs from "@/hooks/useMotionPrefs";

function stripHtml(value) {
  return String(value || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function looksLikeHtml(value) {
  return /<\/?[a-z][\s\S]*>/i.test(String(value || ""));
}

function readingMinutes(text) {
  const words = stripHtml(text)
    .split(/\s+/)
    .filter(Boolean).length;
  if (words < 40) return 0;
  return Math.max(1, Math.round(words / 200));
}

function ShareLinks({ url, title, locale, copied, onCopy }) {
  const waHref = `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`.trim())}`;
  const fbHref = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;

  return (
    <div className="flex w-full flex-col gap-3 bg-[#1B1931] p-5">
      <span className="text-[11px] font-semibold tracking-wide text-brand-lime">
        {t(UI.shareArticle, locale)}
      </span>
      <div className="flex flex-col gap-1 text-sm">
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between bg-[#1F1D35] px-3 py-2.5 text-white transition-colors hover:bg-[#292740]"
        >
          <span>{t(UI.shareWhatsApp, locale)}</span>
        </a>
        <a
          href={fbHref}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between bg-[#1F1D35] px-3 py-2.5 text-white transition-colors hover:bg-[#292740]"
        >
          <span>{t(UI.shareFacebook, locale)}</span>
        </a>
        <button
          type="button"
          onClick={onCopy}
          className="flex items-center justify-between bg-[#1F1D35] px-3 py-2.5 text-start text-white transition-colors hover:bg-[#292740]"
        >
          <span>{copied ? t(UI.linkCopied, locale) : t(UI.copyLink, locale)}</span>
        </button>
      </div>
    </div>
  );
}

export default function ArticleDetails() {
  const { id } = useParams();
  const { locale } = useLocale();
  const { contact } = useSiteData();
  const { reducedMotion } = useMotionPrefs();
  const bodyRef = useRef(null);
  const [copied, setCopied] = useState(false);

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
  const categoryLabel = t(article?.category, locale);
  const caption = t(article?.caption, locale);
  const dateLabel = formatMillis(article?.createdAt, locale);
  const minutes = readingMinutes(`${excerpt} ${content}`);
  const htmlBody = looksLikeHtml(content);

  useEffect(() => {
    const root = bodyRef.current;
    if (!root || reducedMotion) return undefined;
    const nodes = root.querySelectorAll("img, blockquote");
    if (!nodes.length) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-inview");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [content, reducedMotion]);

  const related = useMemo(() => {
    const list = (articlesQuery.data || []).filter((item) => item.id !== id);
    const sameCategory = categoryLabel
      ? list.filter((item) => t(item.category, locale) === categoryLabel)
      : [];
    const pool = [...sameCategory];
    for (const item of list) {
      if (pool.length >= 2) break;
      if (!pool.some((entry) => entry.id === item.id)) pool.push(item);
    }
    return pool.slice(0, 2);
  }, [articlesQuery.data, id, categoryLabel, locale]);

  const shareUrl =
    typeof window !== "undefined" ? window.location.href : `/articles/${id}`;

  const phone = contact?.phones?.[0] || "";
  const askHref = toWhatsAppHref(
    phone,
    t(UI.askAboutArticleMessage, locale).replace("{title}", title || ""),
  );

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const minutesLabel =
    minutes > 0 ? `${minutes} ${t(UI.readingMinutes, locale)}` : "";

  return (
    <>
      <Seo title={title || t(UI.nav.articles, locale)} path={`/articles/${id}`} />
      {articleQuery.isPending ? <Loading /> : null}
      {!articleQuery.isPending && articleQuery.isError ? (
        <ErrorState onRetry={articleQuery.refetch} />
      ) : null}
      {!articleQuery.isPending && !articleQuery.isError && !article ? (
        <main className="pt-navbar min-h-screen bg-transparent">
          <EmptyState message={t(UI.missingArticle, locale)} />
        </main>
      ) : null}
      {!articleQuery.isPending && article ? (
        <main className="min-h-screen bg-transparent text-white">
          <ReadingProgress />

          <article>
            <header className="mx-auto max-w-4xl px-4 pb-8 pt-[calc(var(--navbar-height)+var(--ticker-height)+2.5rem)] sm:px-6 md:pb-10">
              <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-white/55">
                <Link
                  to="/articles"
                  className="inline-flex items-center gap-1 text-brand-lime transition-colors hover:text-brand-lime-hover"
                >
                  <span aria-hidden="true">←</span>
                  <span>{t(UI.backToArticles, locale)}</span>
                </Link>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-[#1F1D35] px-2 py-0.5 text-[11px] font-semibold tracking-wide text-brand-lime">
                    {categoryLabel || t(UI.nav.articles, locale)}
                  </span>
                  {dateLabel ? (
                    <>
                      <span className="text-white/30">·</span>
                      <span>{dateLabel}</span>
                    </>
                  ) : null}
                  {minutesLabel ? (
                    <>
                      <span className="text-white/30">·</span>
                      <span>{minutesLabel}</span>
                    </>
                  ) : null}
                </div>
              </div>

              {title ? (
                <RevealHeading
                  as="h1"
                  text={title}
                  className="mt-6 max-w-full break-words font-display text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[1.15] tracking-tight text-white"
                />
              ) : null}

              {excerpt ? (
                <p className="mt-5 max-w-2xl font-ruqaa text-lg leading-relaxed text-brand-lime/90 md:text-xl">
                  {excerpt}
                </p>
              ) : null}
            </header>

            {article.imageUrl ? (
              <section className="mx-auto my-6 max-w-6xl px-4 sm:px-6">
                <figure>
                  <div className="relative aspect-[21/9] overflow-hidden bg-[#1B1931] sm:aspect-[16/7]">
                    <SafeImage
                      src={article.imageUrl}
                      alt={title}
                      width={1400}
                      className="h-full w-full object-cover"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0A0820] via-transparent to-transparent opacity-60" />
                  </div>
                  {caption ? (
                    <figcaption className="mt-3 text-[13px] text-white/45">
                      {caption}
                    </figcaption>
                  ) : null}
                </figure>
              </section>
            ) : null}

            <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 md:py-14">
              <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-10">
                <aside className="order-2 lg:order-1 lg:col-span-3">
                  <div className="lg:sticky lg:top-[calc(var(--navbar-height)+var(--ticker-height)+1.5rem)]">
                    <ShareLinks
                      url={shareUrl}
                      title={title}
                      locale={locale}
                      copied={copied}
                      onCopy={onCopy}
                    />
                  </div>
                </aside>

                <motion.div
                  className="order-1 lg:order-2 lg:col-span-9"
                  initial={reducedMotion ? false : { opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.08 }}
                  transition={{ duration: 0.5, ease: easeOut }}
                >
                  {content ? (
                    htmlBody ? (
                      <div
                        ref={bodyRef}
                        className="article-body article-body-dark text-[18px] leading-[1.9] text-white/80 md:text-[20px]"
                        dangerouslySetInnerHTML={{ __html: content }}
                      />
                    ) : (
                      <div
                        ref={bodyRef}
                        className="article-body article-body-dark whitespace-pre-wrap text-[18px] leading-[1.9] text-white/80 md:text-[20px]"
                      >
                        {content}
                      </div>
                    )
                  ) : !excerpt ? (
                    <EmptyState message={t(UI.empty, locale)} />
                  ) : null}
                </motion.div>
              </div>
            </div>

            <section className="my-10 bg-[#1B1931] py-10 md:my-14">
              <div className="mx-auto max-w-4xl px-4 sm:px-6">
                <div className="flex flex-col items-center justify-between gap-6 bg-[#1F1D35] p-6 shadow-lg sm:flex-row sm:p-7">
                  <div className="text-center sm:text-start">
                    <h2 className="font-display text-xl font-bold text-white md:text-[22px]">
                      {t(UI.cropQuestion, locale)}
                    </h2>
                  </div>
                  {askHref ? (
                    <a
                      href={askHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex w-full shrink-0 items-center justify-center bg-brand-lime px-6 py-3.5 text-sm font-bold text-[#0A0820] transition-colors hover:bg-brand-lime-hover sm:w-auto"
                    >
                      {t(UI.askAgronomist, locale)}
                    </a>
                  ) : null}
                </div>
              </div>
            </section>

            {related.length > 0 ? (
              <section className="mx-auto max-w-6xl px-4 pb-10 pt-6 sm:px-6 md:pb-14 md:pt-10">
                <motion.div
                  initial={reducedMotion ? false : { opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.12 }}
                  transition={{ duration: 0.5, ease: easeOut }}
                >
                  <div className="mb-8 flex items-center justify-between gap-4">
                    <h3 className="font-display text-[22px] font-semibold text-white md:text-[30px]">
                      {t(UI.moreFieldArticles, locale)}
                    </h3>
                    <Link
                      to="/articles"
                      className="shrink-0 text-sm text-white/55 transition-colors hover:text-brand-lime"
                    >
                      {t(UI.backToArticles, locale)}
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2">
                    {related.map((item, index) => (
                      <motion.div
                        key={item.id}
                        className="self-start"
                        initial={
                          reducedMotion ? false : { opacity: 0, y: 20 }
                        }
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.15 }}
                        transition={{
                          duration: 0.45,
                          delay: reducedMotion
                            ? 0
                            : Math.min(index * 0.08, 0.16),
                          ease: easeOut,
                        }}
                      >
                        <ArticleCard
                          to={`/articles/${item.id}`}
                          imageUrl={item.imageUrl}
                          title={t(item.title, locale)}
                          body={t(item.excerpt, locale)}
                          meta={formatMillis(item.createdAt, locale)}
                          category={t(item.category, locale)}
                          index={index}
                        />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </section>
            ) : null}
          </article>

          <GrowTogetherBanner />
        </main>
      ) : null}
    </>
  );
}
