import React, { useCallback, useEffect, useMemo, useState } from "react";
import { IoSearchOutline, IoClose } from "react-icons/io5";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Seo from "@/components/seo/Seo";
import Loading from "@/components/loading/Loading";
import PageBanner from "@/components/ui/PageBanner";
import Reveal from "@/components/ui/Reveal";
import ProductCard from "@/components/products/ProductCard";
import { EmptyState, ErrorState } from "@/components/ui/StatusMessage";
import { getCategories, getProducts } from "@/services/cms/products";
import { useLocale } from "@/context/LocaleContext";
import { useSiteData } from "@/context/SiteDataContext";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";

const PAGE_SIZE = 9;

export default function Products() {
  const { locale } = useLocale();
  const { contact } = useSiteData();
  const [params, setParams] = useSearchParams();
  const sectionId = params.get("section") || "";
  const subcategoryId = params.get("sub") || "";
  const queryText = params.get("q") || "";
  const pageParam = Number(params.get("page") || "1");
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
      updateParams({ q: next, page: "1" });
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchInput, queryText, updateParams]);

  const activeSection = categories.find((item) => item.id === sectionId);
  const subcategories = activeSection?.subcategories || [];

  const categoryMap = useMemo(() => {
    const map = new Map();
    for (const category of categories) {
      map.set(category.id, category);
    }
    return map;
  }, [categories]);

  const filtered = useMemo(() => {
    const needle = queryText.trim().toLowerCase();
    return products.filter((item) => {
      if (sectionId && item.sectionId !== sectionId) return false;
      if (subcategoryId && item.subcategoryId !== subcategoryId) return false;
      if (!needle) return true;
      const nameAr = String(item.name?.ar || "").toLowerCase();
      const nameEn = String(item.name?.en || "").toLowerCase();
      const category = categoryMap.get(item.sectionId);
      const categoryAr = String(category?.name?.ar || "").toLowerCase();
      const categoryEn = String(category?.name?.en || "").toLowerCase();
      return (
        nameAr.includes(needle) ||
        nameEn.includes(needle) ||
        categoryAr.includes(needle) ||
        categoryEn.includes(needle)
      );
    });
  }, [products, sectionId, subcategoryId, queryText, categoryMap]);

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

  const setCategory = (nextSection) => {
    updateParams({
      section: nextSection,
      sub: "",
      page: "1",
    });
  };

  const setSubcategory = (nextSub) => {
    updateParams({
      section: sectionId,
      sub: nextSub,
      page: "1",
    });
  };

  const clearFilters = () => {
    setSearchInput("");
    setParams(new URLSearchParams(), { replace: true });
  };

  const hasFilters = Boolean(sectionId || subcategoryId || queryText);
  const bannerImage =
    contact?.bannerUrl ||
    products.find((item) => item.imageUrl)?.imageUrl ||
    "";

  const pending = productsQuery.isPending || categoriesQuery.isPending;
  const error = productsQuery.isError || categoriesQuery.isError;

  return (
    <>
      <Seo title={t(UI.nav.products, locale)} path="/products" />
      {pending ? <Loading /> : null}
      {!pending && error ? (
        <ErrorState
          onRetry={() => {
            productsQuery.refetch();
            categoriesQuery.refetch();
          }}
        />
      ) : null}
      {!pending && !error ? (
        <main className="min-h-screen bg-white">
          <PageBanner
            title={t(UI.nav.products, locale)}
            subtitle={t(UI.productsIntro, locale)}
            imageUrl={bannerImage}
            variant="immersive"
            eyebrow={t(UI.nav.products, locale)}
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
                  placeholder={t(UI.searchProducts, locale)}
                  className="w-full rounded-xl border border-black/10 bg-white py-3.5 pe-4 ps-12 text-sm text-brand-ink outline-none transition-shadow focus:border-brand-lime focus:shadow-[0_0_0_3px_rgba(182,212,58,0.2)]"
                />
              </div>
              {hasFilters ? (
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

            <Reveal delay={0.05} className="mb-8">
              <div className="flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={() => setCategory("")}
                  className={`rounded-full px-5 py-2.5 text-sm font-bold transition-all duration-300 ${
                    !sectionId
                      ? "bg-brand-forest-deep text-white shadow-[0_8px_20px_rgba(24,16,96,0.22)]"
                      : "bg-surface-muted text-brand-ink hover:bg-brand-lime hover:text-brand-ink"
                  }`}
                >
                  {t(UI.allProducts, locale)}
                </button>
                {categories.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setCategory(item.id)}
                    className={`rounded-full px-5 py-2.5 text-sm font-bold transition-all duration-300 ${
                      sectionId === item.id
                        ? "bg-brand-forest-deep text-white shadow-[0_8px_20px_rgba(24,16,96,0.22)]"
                        : "bg-surface-muted text-brand-ink hover:bg-brand-lime hover:text-brand-ink"
                    }`}
                  >
                    {t(item.name, locale)}
                  </button>
                ))}
              </div>
            </Reveal>

            {subcategories.length > 0 ? (
              <Reveal delay={0.08} className="mb-10">
                <div className="flex flex-wrap gap-2 border-y border-black/5 py-4">
                  <button
                    type="button"
                    onClick={() => setSubcategory("")}
                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                      !subcategoryId
                        ? "border-brand-lime bg-brand-lime/20 text-brand-ink"
                        : "border-black/10 text-text-muted hover:border-brand-lime hover:text-brand-ink"
                    }`}
                  >
                    {t(UI.allSubcategories, locale)}
                  </button>
                  {subcategories.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSubcategory(item.id)}
                      className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                        subcategoryId === item.id
                          ? "border-brand-lime bg-brand-lime/20 text-brand-ink"
                          : "border-black/10 text-text-muted hover:border-brand-lime hover:text-brand-ink"
                      }`}
                    >
                      {t(item.name, locale)}
                    </button>
                  ))}
                </div>
              </Reveal>
            ) : null}

            <div className="mb-6 flex items-center justify-between gap-3 text-sm text-text-muted">
              <p>
                {filtered.length} {t(UI.resultsCount, locale)}
              </p>
              {activeSection ? (
                <p className="font-semibold text-brand-ink">
                  {t(activeSection.name, locale)}
                </p>
              ) : null}
            </div>

            {filtered.length === 0 ? (
              <EmptyState
                message={
                  queryText
                    ? t(UI.noSearchResults, locale)
                    : t(UI.noProducts, locale)
                }
              />
            ) : (
              <>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
                  {pageItems.map((item, index) => {
                    const category = categoryMap.get(item.sectionId);
                    const subcategory = category?.subcategories?.find(
                      (sub) => sub.id === item.subcategoryId,
                    );
                    return (
                      <Reveal key={item.id} delay={Math.min(index * 0.04, 0.2)}>
                        <ProductCard
                          to={`/products/${item.id}`}
                          imageUrl={item.imageUrl}
                          title={t(item.name, locale)}
                          category={t(category?.name, locale)}
                          subcategory={t(subcategory?.name, locale)}
                          origin={t(item.originCountry, locale)}
                        />
                      </Reveal>
                    );
                  })}
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
