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
import GrowTogetherBanner from "@/components/home/GrowTogetherBanner";
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
    <div>
      <p
        className="font-mono text-[11px] tracking-[2px] text-brand-lime"
        dir="ltr"
      >
        SHARE
      </p>
      <div className="mt-3 flex flex-col gap-2.5 text-[14px] text-white/65">
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          className="text-white transition-colors hover:text-brand-lime"
        >
          {t(UI.shareWhatsApp, locale)}
        </a>
        <a
          href={fbHref}
          target="_blank"
          rel="noopener noreferrer"
          className="text-white transition-colors hover:text-brand-lime"
        >
          {t(UI.shareFacebook, locale)}
        </a>
        <button
          type="button"
          onClick={onCopy}
          className="text-start text-white transition-colors hover:text-brand-lime"
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

  const metaParts = [
    categoryLabel || t(UI.nav.articles, locale),
    dateLabel,
    minutes > 0 ? `${minutes} ${t(UI.readingMinutes, locale)}` : "",
  ].filter(Boolean);

  return (
    <>
      <Seo title={title || t(UI.nav.articles, locale)} path={`/articles/${id}`} />
      {articleQuery.isPending ? <Loading /> : null}
      {!articleQuery.isPending && articleQuery.isError ? (
        <ErrorState onRetry={articleQuery.refetch} />
      ) : null}
      {!articleQuery.isPending && !articleQuery.isError && !article ? (
        <main className="pt-navbar min-h-screen bg-[#0A0820]">
          <EmptyState message={t(UI.missingArticle, locale)} />
        </main>
      ) : null}
      {!articleQuery.isPending && article ? (
        <main className="min-h-screen bg-[#0A0820] text-white">
          <ReadingProgress />

          <article>
            <header className="mx-auto max-w-[1000px] px-6 pb-10 pt-[calc(var(--navbar-height)+var(--ticker-height)+3.5rem)]">
              <Link
                to="/articles"
                className="text-[14px] text-brand-lime transition-colors hover:text-[#B5E06E]"
              >
                ← {t(UI.backToArticles, locale)}
              </Link>

              {metaParts.length ? (
                <div className="mt-7 text-[14px]">
                  <span className="text-brand-lime">{metaParts[0]}</span>
                  {metaParts.slice(1).map((part) => (
                    <span key={part} className="text-white/60">
                      {" "}
                      · {part}
                    </span>
                  ))}
                </div>
              ) : null}

              {title ? (
                <RevealHeading
                  as="h1"
                  text={title}
                  className="mt-[18px] max-w-full break-words font-display text-[clamp(2.5rem,6.5vw,5rem)] font-black leading-[1.15] text-white"
                />
              ) : null}

              {excerpt ? (
                <p className="mt-6 max-w-[720px] text-[20px] leading-[1.7] text-white/72 md:text-[24px]">
                  {excerpt}
                </p>
              ) : null}
            </header>

            {article.imageUrl ? (
              <div className="mx-auto max-w-[1320px] px-6">
                <figure>
                  <div className="overflow-hidden rounded-[20px] border border-white/8 bg-[#110E33]">
                    <SafeImage
                      src={article.imageUrl}
                      alt={title}
                      width={1400}
                      className="h-[280px] w-full object-cover sm:h-[560px]"
                    />
                  </div>
                  {caption ? (
                    <figcaption className="mt-3 text-[13px] text-white/55">
                      {caption}
                    </figcaption>
                  ) : null}
                </figure>
              </div>
            ) : null}

            <div className="mx-auto grid max-w-[1320px] grid-cols-1 gap-10 px-6 py-[72px] lg:grid-cols-[1fr_720px_1fr] lg:gap-10">
              <aside className="hidden lg:block">
                <div className="sticky top-[calc(var(--navbar-height)+var(--ticker-height)+1.5rem)]">
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
                initial={reducedMotion ? false : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.08 }}
                transition={{ duration: 0.5, ease: easeOut }}
              >
                {content ? (
                  htmlBody ? (
                    <div
                      ref={bodyRef}
                      className="article-body article-body-dark text-[20px] leading-[1.95] text-white/85"
                      dangerouslySetInnerHTML={{ __html: content }}
                    />
                  ) : (
                    <div
                      ref={bodyRef}
                      className="article-body article-body-dark whitespace-pre-wrap text-[20px] leading-[1.95] text-white/85"
                    >
                      {content}
                    </div>
                  )
                ) : !excerpt ? (
                  <EmptyState message={t(UI.empty, locale)} />
                ) : null}

                <div className="mt-12 lg:hidden">
                  <ShareLinks
                    url={shareUrl}
                    title={title}
                    locale={locale}
                    copied={copied}
                    onCopy={onCopy}
                  />
                </div>
              </motion.div>

              <div className="hidden lg:block" aria-hidden="true" />
            </div>

            <div className="mx-auto max-w-[1320px] px-6">
              <div className="flex flex-wrap items-center justify-between gap-5 border-y border-white/12 py-8">
                <span className="font-display text-[clamp(1.5rem,4vw,1.875rem)] font-extrabold">
                  {t(UI.cropQuestion, locale)}
                </span>
                {askHref ? (
                  <a
                    href={askHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg bg-brand-lime px-7 py-4 text-[16px] font-semibold text-[#0A0820] transition-colors hover:bg-brand-lime-hover"
                  >
                    {t(UI.askAgronomist, locale)}
                  </a>
                ) : null}
              </div>
            </div>

            {related.length > 0 ? (
              <section className="mx-auto max-w-[1320px] px-6 pb-10 pt-20">
                <motion.div
                  initial={reducedMotion ? false : { opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.12 }}
                  transition={{ duration: 0.5, ease: easeOut }}
                >
                  <div className="flex items-center gap-4 text-[14px] text-white/70">
                    <span>{t(UI.moreFieldArticles, locale)}</span>
                    <span className="h-px flex-1 bg-white/14" aria-hidden="true" />
                    <span className="font-mono text-brand-lime" dir="ltr">
                      § MORE
                    </span>
                  </div>
                  <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
                    {related.map((item) => (
                      <ArticleCard
                        key={item.id}
                        to={`/articles/${item.id}`}
                        imageUrl={item.imageUrl}
                        title={t(item.title, locale)}
                        body={t(item.excerpt, locale)}
                        meta={formatMillis(item.createdAt, locale)}
                        category={t(item.category, locale)}
                      />
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
