import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, useReducedMotion } from "framer-motion";
import Seo from "@/components/seo/Seo";
import Loading from "@/components/loading/Loading";
import Reveal from "@/components/ui/Reveal";
import ReadingProgress from "@/components/ui/ReadingProgress";
import SafeImage from "@/components/ui/SafeImage";
import ContentGrid, { cardLayoutForCount } from "@/components/ui/ContentGrid";
import { PrimaryButton, SecondaryButton } from "@/components/ui/AppButton";
import ArticleCard from "@/components/articles/ArticleCard";
import { EmptyState, ErrorState } from "@/components/ui/StatusMessage";
import { getArticle, getArticles } from "@/services/cms/articles";
import { useLocale } from "@/context/LocaleContext";
import { useSiteData } from "@/context/SiteDataContext";
import { toWhatsAppHref } from "@/lib/phone";
import { easeOut } from "@/lib/motion";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";
import { formatMillis } from "@/lib/time";

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

function ShareLinks({ url, title, locale, copied, onCopy, className = "" }) {
  const waHref = `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`.trim())}`;
  const fbHref = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;

  return (
    <div className={className}>
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-brand-ink">
        {t(UI.shareArticle, locale)}
      </p>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-brand-ink">
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-brand-lime decoration-1 underline-offset-4 transition-colors hover:text-brand-moss"
        >
          {t(UI.shareWhatsApp, locale)}
        </a>
        <span className="text-brand-ink/25" aria-hidden="true">
          ·
        </span>
        <a
          href={fbHref}
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-brand-lime decoration-1 underline-offset-4 transition-colors hover:text-brand-moss"
        >
          {t(UI.shareFacebook, locale)}
        </a>
        <span className="text-brand-ink/25" aria-hidden="true">
          ·
        </span>
        <button
          type="button"
          onClick={onCopy}
          className="underline decoration-brand-lime decoration-1 underline-offset-4 transition-colors hover:text-brand-moss"
        >
          {copied ? t(UI.linkCopied, locale) : t(UI.copyLink, locale)}
        </button>
      </div>
    </div>
  );
}

export default function ArticleDetails() {
  const { id } = useParams();
  const { locale } = useLocale();
  const { contact } = useSiteData();
  const reduceMotion = useReducedMotion();
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
    if (!root || reduceMotion) return undefined;
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
  }, [content, reduceMotion]);

  const related = useMemo(() => {
    const list = (articlesQuery.data || []).filter((item) => item.id !== id);
    const sameCategory = categoryLabel
      ? list.filter((item) => t(item.category, locale) === categoryLabel)
      : [];
    const pool = [...sameCategory];
    for (const item of list) {
      if (pool.length >= 3) break;
      if (!pool.some((entry) => entry.id === item.id)) pool.push(item);
    }
    return pool.slice(0, 3);
  }, [articlesQuery.data, id, categoryLabel, locale]);

  const relatedLayout = cardLayoutForCount(related.length);
  const shareUrl =
    typeof window !== "undefined"
      ? window.location.href
      : `/articles/${id}`;

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

          <header className="pt-[140px]">
            <motion.div
              className="container mx-auto px-4 lg:px-8"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.45, ease: easeOut }}
            >
              <SecondaryButton to="/articles" className="mb-8">
                {t(UI.backToArticles, locale)}
              </SecondaryButton>

              <p className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                <span className="font-semibold text-brand-lime">
                  {categoryLabel || t(UI.nav.articles, locale)}
                </span>
                {dateLabel ? (
                  <>
                    <span className="text-brand-ink/25" aria-hidden="true">
                      ·
                    </span>
                    <span className="text-text-muted">{dateLabel}</span>
                  </>
                ) : null}
                {minutes > 0 ? (
                  <>
                    <span className="text-brand-ink/25" aria-hidden="true">
                      ·
                    </span>
                    <span className="text-text-muted">
                      {minutes} {t(UI.readingMinutes, locale)}
                    </span>
                  </>
                ) : null}
              </p>

              {title ? (
                <h1 className="max-w-[900px] text-[clamp(2.25rem,5vw,4.25rem)] font-extrabold leading-[1.05] tracking-tight text-brand-ink">
                  {title}
                </h1>
              ) : null}

              {excerpt ? (
                <p className="mt-6 max-w-[720px] text-lg leading-9 text-text-muted sm:text-xl sm:leading-10">
                  {excerpt}
                </p>
              ) : null}

              {article.imageUrl ? (
                <figure className="mt-10">
                  <div className="overflow-hidden rounded-lg bg-surface-muted">
                    <SafeImage
                      src={article.imageUrl}
                      alt={title}
                      className="aspect-[16/9] w-full object-cover"
                    />
                  </div>
                  {caption ? (
                    <figcaption className="mt-3 text-sm text-text-muted">
                      {caption}
                    </figcaption>
                  ) : null}
                </figure>
              ) : null}
            </motion.div>
          </header>

          <div className="container mx-auto px-4 py-12 lg:px-8 lg:py-16">
            <div className="relative mx-auto max-w-[720px]">
              <aside className="pointer-events-none absolute top-0 hidden w-40 lg:block xl:-start-52 xl:w-44">
                <div className="pointer-events-auto sticky top-[calc(var(--navbar-height)+1.5rem)]">
                  <ShareLinks
                    url={shareUrl}
                    title={title}
                    locale={locale}
                    copied={copied}
                    onCopy={onCopy}
                  />
                </div>
              </aside>

              <Reveal>
                {content ? (
                  htmlBody ? (
                    <div
                      ref={bodyRef}
                      className="article-body"
                      dangerouslySetInnerHTML={{ __html: content }}
                    />
                  ) : (
                    <div ref={bodyRef} className="article-body whitespace-pre-wrap">
                      {content}
                    </div>
                  )
                ) : !excerpt ? (
                  <EmptyState message={t(UI.empty, locale)} />
                ) : null}
              </Reveal>

              <div className="mt-12 lg:hidden">
                <ShareLinks
                  url={shareUrl}
                  title={title}
                  locale={locale}
                  copied={copied}
                  onCopy={onCopy}
                />
              </div>
            </div>

            <div className="mx-auto mt-16 max-w-[720px] border-y border-brand-ink/15 py-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xl font-extrabold text-brand-ink sm:text-2xl">
                  {t(UI.cropQuestion, locale)}
                </p>
                {askHref ? (
                  <PrimaryButton href={askHref}>
                    {t(UI.askAgronomist, locale)}
                  </PrimaryButton>
                ) : null}
              </div>
            </div>
          </div>

          {related.length > 0 ? (
            <section className="border-t border-brand-ink/10 py-14 lg:py-16">
              <div className="container mx-auto px-4 lg:px-8">
                <Reveal className="mb-8">
                  <h2 className="text-2xl font-extrabold text-brand-ink sm:text-3xl">
                    {t(UI.moreFieldArticles, locale)}
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
                        category={t(item.category, locale)}
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
