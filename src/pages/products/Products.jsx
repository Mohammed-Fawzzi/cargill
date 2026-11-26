import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Seo from "@/components/seo/Seo";
import Loading from "@/components/loading/Loading";
import ProductCard from "@/components/products/ProductCard";
import GrowTogetherBanner from "@/components/shared/GrowTogetherBanner";
import PageHero from "@/components/ui/PageHero";
import { EmptyState, ErrorState } from "@/components/ui/StatusMessage";
import { getCategories, getCategoriesPage, getProducts } from "@/services/cms/products";
import { useHomepageSection } from "@/hooks/useHomepageSection";
import { useLocale } from "@/context/LocaleContext";
import { useSiteData } from "@/context/SiteDataContext";
import { resolvePageHero } from "@/lib/pageHero";
import { categoryCoverImages } from "@/lib/homeIntro";
import { warnMissingMedia } from "@/lib/image";
import { toWhatsAppHref } from "@/lib/phone";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";
import { easeOut } from "@/lib/motion";
import useMotionPrefs from "@/hooks/useMotionPrefs";
import SlidingTabs from "@/components/ui/SlidingTabs";

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
  const pageQuery = useQuery({
    queryKey: ["cms", "categories-page"],
    queryFn: getCategoriesPage,
    staleTime: 1000 * 60 * 5,
  });

  const allCategories = useMemo(
    () => categoriesQuery.data || [],
    [categoriesQuery.data],
  );
  const categories = useMemo(
    () =>
      allCategories.filter((category) => {
        const ar = String(category?.name?.ar || "").toLowerCase();
        const en = String(category?.name?.en || "").toLowerCase();
        const id = String(category?.id || "").toLowerCase();
        return (
          !ar.includes("بذور") && !en.includes("seed") && !id.includes("seed")
        );
      }),
    [allCategories],
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
    for (const category of allCategories) {
      map.set(category.id, category);
    }
    return map;
  }, [allCategories]);

  useEffect(() => {
    if (!sectionId || categoriesQuery.isPending) return;
    const selected = categoryMap.get(sectionId);
    if (!selected) {
      updateParams({ section: "", sub: "" });
      return;
    }
    const ar = String(selected?.name?.ar || "").toLowerCase();
    const en = String(selected?.name?.en || "").toLowerCase();
    const id = String(selected?.id || "").toLowerCase();
    if (ar.includes("بذور") || en.includes("seed") || id.includes("seed")) {
      updateParams({ section: "", sub: "" });
    }
  }, [sectionId, categoryMap, categoriesQuery.isPending, updateParams]);

  const activeCategory = sectionId ? categoryMap.get(sectionId) : null;
  const subcategories = activeCategory?.subcategories || [];

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

  const setCategory = (nextSection) => {
    updateParams({
      section: nextSection,
      sub: "",
    });
  };

  const setSubcategory = (nextSub) => {
    updateParams({ sub: nextSub });
  };

  const hero = resolvePageHero({
    section: sectionQuery.data,
    contact,
    locale,
    fallbackTitle: t(UI.nav.products, locale),
    fallbackSubtitle: t(UI.productsIntro, locale),
    fallbackImage: pageQuery.data?.imageUrl || "",
    fallbackVideo: pageQuery.data?.videoUrl || "",
    videoCandidates: [
      ...(categories || []).map((item) => item.videoUrl),
      ...(products || []).map((item) => item.videoUrl),
    ],
  });

  const heroImage = hero.imageUrl || pageQuery.data?.imageUrl || "";
  const heroVideo = hero.videoUrl;
  const heroVideos = hero.videoUrls;
  useEffect(() => {
    warnMissingMedia("product_categories/page.imageUrl", heroImage);
  }, [heroImage]);
  const heroSides = useMemo(() => {
    const covers = categoryCoverImages(categories, products);
    const sectionImage = sectionQuery.data?.imageUrl || "";
    return [sectionImage, ...covers].filter(
      (src, index, list) => src && src !== heroImage && list.indexOf(src) === index,
    );
  }, [sectionQuery.data?.imageUrl, categories, products, heroImage]);
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
        <main className="min-h-screen bg-transparent text-white">
          <PageHero
            title={hero.title}
            description={hero.subtitle}
            imageUrl={heroImage}
            videoUrl={heroVideo}
            videoUrls={heroVideos}
            sideImages={heroSides}
            size="mid"
            crumbs={[
              { label: t(UI.nav.home, locale), to: "/" },
              { label: t(UI.nav.products, locale) },
            ]}
          />

          <div className="sticky top-[calc(var(--navbar-height)+var(--ticker-height))] z-20 border-b border-white/8 bg-[#0A0820]/90 backdrop-blur-xl">
            <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
              <SlidingTabs
                value={sectionId || ""}
                onChange={setCategory}
                trackClassName="bg-[#1B1931]"
                items={[
                  { id: "", label: t(UI.filterAll, locale) },
                  ...categories.map((item) => ({
                    id: item.id,
                    label: t(item.name, locale),
                  })),
                ]}
              />

              <div className="flex items-center gap-3">
                <label className="relative min-w-0 flex-1 sm:w-80">
                  <span className="sr-only">{t(UI.search, locale)}</span>
                  <input
                    type="search"
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    placeholder={t(UI.searchProducts, locale)}
                    className="w-full bg-[#1B1931] px-4 py-2.5 pe-10 text-sm text-white outline-none transition-colors placeholder:text-white/40 focus:bg-[#1F1D35]"
                  />
                  <svg
                    className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40"
                    viewBox="0 0 16 16"
                    aria-hidden="true"
                  >
                    <circle
                      cx="7"
                      cy="7"
                      r="5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.3"
                    />
                    <path
                      d="M11 11 L15 15"
                      stroke="currentColor"
                      strokeWidth="1.3"
                    />
                  </svg>
                </label>
                <div className="hidden shrink-0 items-center gap-2 bg-[#1F1D35] px-4 py-2.5 sm:flex">
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-brand-lime"
                    aria-hidden="true"
                  />
                  <span className="text-[11px] font-medium tracking-wide text-white/55">
                    {filtered.length} {t(UI.productsCount, locale)}
                  </span>
                </div>
              </div>
            </div>

            {sectionId && subcategories.length > 0 ? (
              <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 pb-3 sm:px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <button
                  type="button"
                  onClick={() => setSubcategory("")}
                  className={`whitespace-nowrap border px-3 py-1.5 text-xs transition-colors ${!subcategoryId
                      ? "border-brand-lime/50 bg-brand-lime/15 text-brand-lime"
                      : "border-white/10 text-white/55 hover:border-white/25 hover:text-white"
                    }`}
                >
                  {t(UI.allSubcategories, locale)}
                </button>
                {subcategories.map((sub) => {
                  const active = subcategoryId === sub.id;
                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => setSubcategory(sub.id)}
                      className={`whitespace-nowrap border px-3 py-1.5 text-xs transition-colors ${active
                          ? "border-brand-lime/50 bg-brand-lime/15 text-brand-lime"
                          : "border-white/10 text-white/55 hover:border-white/25 hover:text-white"
                        }`}
                    >
                      {t(sub.name, locale)}
                    </button>
                  );
                })}

              </div>
            ) : null}
          </div>

          <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center gap-4 py-16 text-center">
                <EmptyState
                  message={
                    queryText
                      ? t(UI.noSearchResults, locale)
                      : t(UI.noProducts, locale)
                  }
                />
                {queryText ? (
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setSearchInput("");
                        updateParams({ q: "", section: "", sub: "" });
                      }}
                      className="bg-[#1F1D35] px-5 py-2.5 text-sm font-medium text-brand-lime transition-colors hover:bg-[#292740]"
                    >
                      {t(UI.clearFilters, locale)}
                    </button>
                    {askSearchHref ? (
                      <a
                        href={askSearchHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-brand-lime px-5 py-2.5 text-sm font-semibold text-[#0A0820] transition-colors hover:bg-brand-lime-hover"
                      >
                        {t(UI.askAgronomist, locale)}
                      </a>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {filtered.map((item, index) => (
                  <motion.div
                    key={item.id}
                    className="self-start"
                    initial={reducedMotion ? false : { opacity: 0, y: 22 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.12 }}
                    transition={{
                      duration: 0.45,
                      delay: reducedMotion ? 0 : Math.min(index * 0.08, 0.48),
                      ease: easeOut,
                    }}
                  >
                    <ProductCard
                      to={`/products/${item.id}`}
                      imageUrl={item.imageUrl}
                      videoUrl={item.videoUrl || ""}
                      title={t(item.name, locale)}
                      subcategory={t(item._subName, locale)}
                      category={t(item._categoryName, locale)}
                      origin={t(item.originCountry, locale)}
                      overview={
                        t(item.overview, locale) || t(item.details, locale)
                      }
                      index={index}
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
