import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Seo from "@/components/seo/Seo";
import Loading from "@/components/loading/Loading";
import ProductCard from "@/components/products/ProductCard";
import GrowTogetherBanner from "@/components/home/GrowTogetherBanner";
import RevealHeading from "@/components/ui/RevealHeading";
import LogoTriangle from "@/components/ui/LogoTriangle";
import { EmptyState, ErrorState } from "@/components/ui/StatusMessage";
import { getCategories, getProducts } from "@/services/cms/products";
import { useHomepageSection } from "@/hooks/useHomepageSection";
import { useLocale } from "@/context/LocaleContext";
import { useSiteData } from "@/context/SiteDataContext";
import { resolvePageHero } from "@/lib/pageHero";
import { toWhatsAppHref } from "@/lib/phone";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";
import { easeOut } from "@/lib/motion";
import useMotionPrefs from "@/hooks/useMotionPrefs";

function productMatchesNeedle(item, needle, categoryMap) {
  if (!needle) return true;
  const nameAr = String(item.name?.ar || "").toLowerCase();
  const nameEn = String(item.name?.en || "").toLowerCase();
  const category = categoryMap.get(item.sectionId);
  const categoryAr = String(category?.name?.ar || "").toLowerCase();
  const categoryEn = String(category?.name?.en || "").toLowerCase();
  const sub = category?.subcategories?.find((s) => s.id === item.subcategoryId);
  const subAr = String(sub?.name?.ar || "").toLowerCase();
  const subEn = String(sub?.name?.en || "").toLowerCase();
  const cropHits = (item.agriculturalUses || []).some((row) => {
    const crop = row.cells?.crop;
    return (
      String(crop?.ar || "")
        .toLowerCase()
        .includes(needle) ||
      String(crop?.en || "")
        .toLowerCase()
        .includes(needle)
    );
  });
  return (
    nameAr.includes(needle) ||
    nameEn.includes(needle) ||
    categoryAr.includes(needle) ||
    categoryEn.includes(needle) ||
    subAr.includes(needle) ||
    subEn.includes(needle) ||
    cropHits
  );
}

export default function Products() {
  const { locale } = useLocale();
  const { contact } = useSiteData();
  const { reducedMotion } = useMotionPrefs();
  const sectionQuery = useHomepageSection("product_categories");
  const [params, setParams] = useSearchParams();
  const sectionId = params.get("section") || "";
  const subcategoryId = params.get("sub") || "";
  const queryText = params.get("q") || "";
  const [searchInput, setSearchInput] = useState(queryText);

  const productsQuery = useQuery({
    queryKey: ["cms", "products"],
    queryFn: getProducts,
    staleTime: 1000 * 60 * 2,
  });
  const categoriesQuery = useQuery({
    queryKey: ["cms", "categories"],
    queryFn: getCategories,
    staleTime: 1000 * 60 * 5,
  });

  const categories = useMemo(
    () => categoriesQuery.data || [],
    [categoriesQuery.data],
  );
  const products = useMemo(
    () => productsQuery.data || [],
    [productsQuery.data],
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
      updateParams({ q: next });
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchInput, queryText, updateParams]);

  const categoryMap = useMemo(() => {
    const map = new Map();
    for (const category of categories) {
      map.set(category.id, category);
    }
    return map;
  }, [categories]);

  const enriched = useMemo(() => {
    return products.map((item) => {
      const category = categoryMap.get(item.sectionId);
      const sub = category?.subcategories?.find(
        (entry) => entry.id === item.subcategoryId,
      );
      return {
        ...item,
        _categoryName: category?.name,
        _subName: sub?.name,
      };
    });
  }, [products, categoryMap]);

  const filtered = useMemo(() => {
    const needle = queryText.trim().toLowerCase();
    return enriched.filter((item) => {
      if (sectionId && item.sectionId !== sectionId) return false;
      if (subcategoryId && item.subcategoryId !== subcategoryId) return false;
      return productMatchesNeedle(item, needle, categoryMap);
    });
  }, [enriched, sectionId, subcategoryId, queryText, categoryMap]);

  const groups = useMemo(() => {
    if (sectionId) {
      const category = categoryMap.get(sectionId);
      return [
        {
          id: sectionId,
          name: t(category?.name, locale) || t(UI.nav.products, locale),
          items: filtered,
        },
      ].filter((group) => group.items.length > 0);
    }

    return categories
      .map((category) => ({
        id: category.id,
        name: t(category.name, locale),
        items: filtered.filter((item) => item.sectionId === category.id),
      }))
      .filter((group) => group.items.length > 0);
  }, [sectionId, filtered, categories, categoryMap, locale]);

  const setCategory = (nextSection) => {
    updateParams({
      section: nextSection,
      sub: "",
    });
  };

  const categoryNames = categories
    .map((item) => t(item.name, locale))
    .filter(Boolean)
    .join("، ");

  const hero = resolvePageHero({
    section: sectionQuery.data,
    contact,
    locale,
    fallbackTitle: t(UI.nav.products, locale),
    fallbackSubtitle: categoryNames || t(UI.productsIntro, locale),
    fallbackImage: products.find((item) => item.imageUrl)?.imageUrl || "",
  });

  const phone = contact?.phones?.[0] || "";
  const askSearchHref = toWhatsAppHref(
    phone,
    t(UI.askAboutSearchMessage, locale).replace(
      "{q}",
      queryText.trim() || searchInput.trim(),
    ),
  );

  const pending = productsQuery.isPending || categoriesQuery.isPending;
  const error = productsQuery.isError || categoriesQuery.isError;
  const showGrouped = !sectionId;

  return (
    <>
      <Seo title={hero.title} description={hero.subtitle} path="/products" />
      {pending ? <Loading /> : null}
      {!pending && error ? (
        <ErrorState
          onRetry={() => {
            productsQuery.refetch();
            categoriesQuery.refetch();
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
                  <li>{t(UI.nav.products, locale)}</li>
                </ol>
              </nav>
              <span className="h-px flex-1 bg-white/14" aria-hidden="true" />
            </div>

            <div className="mt-7 flex flex-wrap items-end justify-between gap-8">
              <div className="min-w-0 flex-1">
                <RevealHeading
                  as="h1"
                  text={hero.title}
                  className="max-w-full break-words font-display text-[clamp(2.75rem,8.5vw,7.5rem)] font-black leading-[1.1] text-white"
                />
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
                {UI.pageLabel.products}
              </div>
            </div>
          </header>

          <div className="sticky top-[calc(var(--navbar-height)+var(--ticker-height))] z-20 border-b border-white/12 bg-[#0A0820]">
            <div className="mx-auto flex max-w-[1320px] flex-col gap-4 px-6 md:flex-row md:items-center md:justify-between md:gap-6">
              <div className="flex flex-wrap items-center gap-x-[30px] gap-y-1 text-[16px]">
                <button
                  type="button"
                  onClick={() => setCategory("")}
                  className={`border-b-2 py-4 transition-colors ${
                    !sectionId
                      ? "border-brand-lime font-semibold text-white"
                      : "border-transparent font-normal text-white/65 hover:text-white"
                  }`}
                >
                  {t(UI.filterAll, locale)}
                </button>
                {categories.map((item) => {
                  const active = sectionId === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setCategory(item.id)}
                      className={`border-b-2 py-4 transition-colors ${
                        active
                          ? "border-brand-lime font-semibold text-white"
                          : "border-transparent font-normal text-white/65 hover:text-white"
                      }`}
                    >
                      {t(item.name, locale)}
                    </button>
                  );
                })}
                <span className="py-4 text-[13px] text-white/55">
                  {filtered.length} {t(UI.resultsCount, locale)}
                </span>
              </div>

              <label className="flex min-w-0 items-center gap-2.5 border-b border-white/30 py-2 md:min-w-[280px]">
                <span className="sr-only">{t(UI.search, locale)}</span>
                <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                  <circle
                    cx="7"
                    cy="7"
                    r="5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.3"
                  />
                  <path d="M11 11 L15 15" stroke="currentColor" strokeWidth="1.3" />
                </svg>
                <input
                  type="search"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder={t(UI.searchProducts, locale)}
                  className="min-w-0 flex-1 border-0 bg-transparent text-[15px] text-white outline-none placeholder:text-white/45"
                />
              </label>
            </div>
          </div>

          <section className="mx-auto max-w-[1320px] px-6 pb-[100px] pt-16">
            {filtered.length === 0 ? (
              <div className="space-y-5">
                <EmptyState
                  message={
                    queryText
                      ? t(UI.noSearchResults, locale)
                      : t(UI.noProducts, locale)
                  }
                />
                {queryText && askSearchHref ? (
                  <a
                    href={askSearchHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex rounded-lg bg-brand-lime px-6 py-3 font-semibold text-[#0A0820] transition-colors hover:bg-brand-lime-hover"
                  >
                    {t(UI.askAgronomist, locale)}
                  </a>
                ) : null}
              </div>
            ) : showGrouped ? (
              <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-6 lg:grid-cols-4 lg:gap-6">
                {groups.map((group, index) => (
                  <motion.div
                    key={group.id}
                    initial={reducedMotion ? false : { opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.12 }}
                    transition={{
                      duration: 0.45,
                      delay: Math.min(index * 0.05, 0.2),
                      ease: easeOut,
                    }}
                  >
                    <div className="mb-[18px] flex flex-wrap items-baseline gap-3">
                      <span
                        className="font-mono text-[13px] text-brand-lime"
                        dir="ltr"
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="font-display text-[22px] font-extrabold">
                        {group.name}
                      </span>
                      <span className="text-[13px] text-white/55">
                        {group.items.length} {t(UI.productsCount, locale)}
                      </span>
                    </div>
                    <div className="flex flex-col gap-8">
                      {group.items.map((item) => (
                        <ProductCard
                          key={item.id}
                          to={`/products/${item.id}`}
                          imageUrl={item.imageUrl}
                          title={t(item.name, locale)}
                          subcategory={t(item._subName, locale)}
                          origin={t(item.originCountry, locale)}
                        />
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {filtered.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={reducedMotion ? false : { opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.12 }}
                    transition={{
                      duration: 0.45,
                      delay: Math.min(index * 0.04, 0.2),
                      ease: easeOut,
                    }}
                  >
                    <ProductCard
                      to={`/products/${item.id}`}
                      imageUrl={item.imageUrl}
                      title={t(item.name, locale)}
                      subcategory={t(item._subName, locale)}
                      origin={t(item.originCountry, locale)}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </section>

          <GrowTogetherBanner />
        </main>
      ) : null}
    </>
  );
}
