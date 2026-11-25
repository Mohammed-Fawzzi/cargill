import React, { useCallback, useEffect, useMemo, useState } from "react";
import { IoSearchOutline } from "react-icons/io5";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Seo from "@/components/seo/Seo";
import Loading from "@/components/loading/Loading";
import PageBanner from "@/components/ui/PageBanner";
import Reveal from "@/components/ui/Reveal";
import FilterTabs from "@/components/ui/FilterTabs";
import ContentGrid, { cardLayoutForCount } from "@/components/ui/ContentGrid";
import { PrimaryButton, SecondaryButton } from "@/components/ui/AppButton";
import ProductCard from "@/components/products/ProductCard";
import { EmptyState, ErrorState } from "@/components/ui/StatusMessage";
import { getCategories, getProducts } from "@/services/cms/products";
import { useHomepageSection } from "@/hooks/useHomepageSection";
import { useLocale } from "@/context/LocaleContext";
import { useSiteData } from "@/context/SiteDataContext";
import { resolvePageHero } from "@/lib/pageHero";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";

const PAGE_SIZE = 9;

export default function Products() {
  const { locale } = useLocale();
  const { contact } = useSiteData();
  const sectionQuery = useHomepageSection("product_categories");
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
  const fallbackImage =
    products.find((item) => item.imageUrl)?.imageUrl || "";
  const hero = resolvePageHero({
    section: sectionQuery.data,
    contact,
    locale,
    fallbackTitle: t(UI.nav.products, locale),
    fallbackSubtitle: t(UI.productsIntro, locale),
    fallbackImage,
  });

  const categoryTabs = useMemo(
    () => [
      { id: "", label: t(UI.allProducts, locale) },
      ...categories.map((item) => ({
        id: item.id,
        label: t(item.name, locale),
      })),
    ],
    [categories, locale],
  );

  const subcategoryTabs = useMemo(
    () => [
      { id: "", label: t(UI.allSubcategories, locale) },
      ...subcategories.map((item) => ({
        id: item.id,
        label: t(item.name, locale),
      })),
    ],
    [subcategories, locale],
  );

  const cardLayout = cardLayoutForCount(pageItems.length);
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
        <main className="min-h-screen bg-white">
          <PageBanner
            title={hero.title}
            subtitle={hero.subtitle}
            imageUrl={hero.imageUrl}
            label={UI.pageLabel.products}
            breadcrumbs={[
              { label: t(UI.nav.home, locale), to: "/" },
              { label: t(UI.nav.products, locale) },
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
                  placeholder={t(UI.searchProducts, locale)}
                  className="w-full rounded-md border border-brand-ink/15 bg-white py-3.5 pe-4 ps-12 text-sm text-brand-ink outline-none transition-colors focus:border-brand-lime"
                />
              </div>
              {hasFilters ? (
                <SecondaryButton onClick={clearFilters}>
                  {t(UI.clearFilters, locale)}
                </SecondaryButton>
              ) : null}
            </Reveal>

            <Reveal delay={0.05} className="mb-6">
              <FilterTabs
                items={categoryTabs}
                value={sectionId}
                onChange={setCategory}
                count={filtered.length}
                countLabel={t(UI.resultsCount, locale)}
              />
            </Reveal>

            {subcategories.length > 0 ? (
              <Reveal delay={0.08} className="mb-10">
                <FilterTabs
                  items={subcategoryTabs}
                  value={subcategoryId}
                  onChange={setSubcategory}
                />
              </Reveal>
            ) : null}

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
                <ContentGrid count={pageItems.length}>
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
                          layout={cardLayout}
                        />
                      </Reveal>
                    );
                  })}
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
