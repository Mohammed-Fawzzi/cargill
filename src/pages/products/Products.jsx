import React, { useCallback, useEffect, useMemo, useState } from "react";
import { IoSearchOutline } from "react-icons/io5";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";
import Seo from "@/components/seo/Seo";
import Loading from "@/components/loading/Loading";
import PageBanner from "@/components/ui/PageBanner";
import Reveal from "@/components/ui/Reveal";
import FilterTabs from "@/components/ui/FilterTabs";
import ContentGrid, { cardLayoutForCount } from "@/components/ui/ContentGrid";
import { SecondaryButton } from "@/components/ui/AppButton";
import ProductCard from "@/components/products/ProductCard";
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

function ProductGroup({ group, locale, index }) {
  const layout = cardLayoutForCount(group.items.length);
  const number = String(index + 1).padStart(2, "0");

  return (
    <section className="mb-14 last:mb-0 lg:mb-16">
      <div className="mb-8 flex items-end gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h2 className="text-2xl font-extrabold tracking-tight text-brand-ink sm:text-3xl">
              {group.name}
            </h2>
            <span className="text-sm text-text-muted">
              {group.items.length} {t(UI.productsCount, locale)}
            </span>
          </div>
          <div className="mt-3 h-px w-full bg-brand-ink/15" aria-hidden="true" />
        </div>
        <span className="shrink-0 pb-1 text-[11px] font-bold tracking-[0.2em] text-brand-ink/40">
          {number}
        </span>
      </div>

      <ContentGrid>
        {group.items.map((item, itemIndex) => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, delay: itemIndex * 0.06, ease: easeOut }}
          >
            <ProductCard
              to={`/products/${item.id}`}
              imageUrl={item.imageUrl}
              title={t(item.name, locale)}
              subcategory={t(item._subName, locale)}
              origin={t(item.originCountry, locale)}
              layout={layout}
            />
          </motion.div>
        ))}
      </ContentGrid>
    </section>
  );
}

export default function Products() {
  const { locale } = useLocale();
  const { contact } = useSiteData();
  const reduceMotion = useReducedMotion();
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

  const hero = resolvePageHero({
    section: sectionQuery.data,
    contact,
    locale,
    fallbackTitle: t(UI.nav.products, locale),
    fallbackSubtitle: t(UI.productsIntro, locale),
    fallbackImage: products.find((item) => item.imageUrl)?.imageUrl || "",
  });

  const categoryTabs = useMemo(
    () => [
      { id: "", label: t(UI.filterAll, locale) },
      ...categories.map((item) => ({
        id: item.id,
        label: t(item.name, locale),
      })),
    ],
    [categories, locale],
  );

  const phone = contact?.phones?.[0] || "";
  const askSearchHref = toWhatsAppHref(
    phone,
    t(UI.askAboutSearchMessage, locale).replace(
      "{q}",
      queryText.trim() || searchInput.trim(),
    ),
  );

  const flatLayout = cardLayoutForCount(filtered.length);
  const showGrouped = !sectionId;
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

          <div className="sticky top-[var(--navbar-height)] z-20 border-b border-brand-ink/10 bg-white">
            <div className="container mx-auto flex flex-col gap-5 px-4 py-4 lg:flex-row lg:items-end lg:justify-between lg:gap-10 lg:px-8">
              <div className="min-w-0 flex-1">
                <FilterTabs
                  items={categoryTabs}
                  value={sectionId}
                  onChange={setCategory}
                  count={filtered.length}
                  countLabel={t(UI.resultsCount, locale)}
                />
              </div>
              <label className="relative block w-full shrink-0 lg:max-w-sm">
                <span className="sr-only">{t(UI.search, locale)}</span>
                <IoSearchOutline
                  className="pointer-events-none absolute start-0 top-1/2 -translate-y-1/2 text-lg text-brand-ink/40"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder={t(UI.searchProducts, locale)}
                  className="w-full border-0 border-b border-brand-ink/20 bg-transparent py-2.5 ps-8 pe-2 text-sm text-brand-ink outline-none transition-colors placeholder:text-text-muted/70 focus:border-brand-lime"
                />
              </label>
            </div>
          </div>

          <div className="container mx-auto px-4 py-12 lg:px-8 lg:py-16">
            {filtered.length === 0 ? (
              <div className="space-y-4">
                <EmptyState
                  message={
                    queryText
                      ? t(UI.noSearchResults, locale)
                      : t(UI.noProducts, locale)
                  }
                />
                {queryText && askSearchHref ? (
                  <SecondaryButton href={askSearchHref}>
                    {t(UI.askAgronomist, locale)}
                  </SecondaryButton>
                ) : null}
              </div>
            ) : (
              <LayoutGroup>
                <AnimatePresence mode="popLayout" initial={false}>
                  {showGrouped ? (
                    groups.map((group, index) => (
                      <motion.div
                        key={group.id}
                        layout={!reduceMotion}
                        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{
                          duration: 0.3,
                          delay: Math.min(index * 0.04, 0.16),
                          ease: easeOut,
                        }}
                      >
                        <ProductGroup group={group} locale={locale} index={index} />
                      </motion.div>
                    ))
                  ) : (
                    <ContentGrid>
                      {filtered.map((item, index) => (
                        <motion.div
                          key={item.id}
                          layout={!reduceMotion}
                          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{
                            duration: 0.3,
                            delay: Math.min(index * 0.06, 0.3),
                            ease: easeOut,
                          }}
                        >
                          <ProductCard
                            to={`/products/${item.id}`}
                            imageUrl={item.imageUrl}
                            title={t(item.name, locale)}
                            subcategory={t(item._subName, locale)}
                            origin={t(item.originCountry, locale)}
                            layout={flatLayout}
                          />
                        </motion.div>
                      ))}
                    </ContentGrid>
                  )}
                </AnimatePresence>
              </LayoutGroup>
            )}
          </div>
        </main>
      ) : null}
    </>
  );
}
