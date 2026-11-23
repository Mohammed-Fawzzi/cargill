import React, { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Seo from "@/components/seo/Seo";
import Loading from "@/components/loading/Loading";
import PageBanner from "@/components/ui/PageBanner";
import MediaCard from "@/components/ui/MediaCard";
import { EmptyState, ErrorState, PageShell } from "@/components/ui/StatusMessage";
import { getCategories, getProducts } from "@/services/cms/products";
import { useLocale } from "@/context/LocaleContext";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";

export default function Products() {
  const { locale } = useLocale();
  const [params, setParams] = useSearchParams();
  const sectionId = params.get("section") || "";
  const subcategoryId = params.get("sub") || "";

  const productsQuery = useQuery({
    queryKey: ["cms", "products"],
    queryFn: getProducts,
  });
  const categoriesQuery = useQuery({
    queryKey: ["cms", "categories"],
    queryFn: getCategories,
  });

  const categories = categoriesQuery.data || [];
  const activeSection = categories.find((item) => item.id === sectionId);
  const subcategories = activeSection?.subcategories || [];

  const items = useMemo(() => {
    const list = productsQuery.data || [];
    return list.filter((item) => {
      if (sectionId && item.sectionId !== sectionId) return false;
      if (subcategoryId && item.subcategoryId !== subcategoryId) return false;
      return true;
    });
  }, [productsQuery.data, sectionId, subcategoryId]);

  const updateFilter = (nextSection, nextSub) => {
    const next = new URLSearchParams();
    if (nextSection) next.set("section", nextSection);
    if (nextSection && nextSub) next.set("sub", nextSub);
    setParams(next, { replace: true });
  };

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
        <PageShell>
          <PageBanner title={t(UI.nav.products, locale)} />
          <div className="container mx-auto px-4 py-10 lg:px-8">
            <div className="mb-8 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => updateFilter("", "")}
                className={`rounded-full px-4 py-2 text-sm font-bold ${
                  !sectionId
                    ? "bg-brand-black text-white"
                    : "bg-surface-muted text-brand-ink hover:bg-brand-lime"
                }`}
              >
                {t(UI.allCategories, locale)}
              </button>
              {categories.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => updateFilter(item.id, "")}
                  className={`rounded-full px-4 py-2 text-sm font-bold ${
                    sectionId === item.id
                      ? "bg-brand-black text-white"
                      : "bg-surface-muted text-brand-ink hover:bg-brand-lime"
                  }`}
                >
                  {t(item.name, locale)}
                </button>
              ))}
            </div>

            {subcategories.length > 0 ? (
              <div className="mb-8 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => updateFilter(sectionId, "")}
                  className={`rounded-full border px-4 py-1.5 text-sm ${
                    !subcategoryId
                      ? "border-brand-lime bg-brand-lime/20"
                      : "border-black/10"
                  }`}
                >
                  {t(UI.allSubcategories, locale)}
                </button>
                {subcategories.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => updateFilter(sectionId, item.id)}
                    className={`rounded-full border px-4 py-1.5 text-sm ${
                      subcategoryId === item.id
                        ? "border-brand-lime bg-brand-lime/20"
                        : "border-black/10"
                    }`}
                  >
                    {t(item.name, locale)}
                  </button>
                ))}
              </div>
            ) : null}

            {items.length === 0 ? (
              <EmptyState message={t(UI.noProducts, locale)} />
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                  <MediaCard
                    key={item.id}
                    to={`/products/${item.id}`}
                    imageUrl={item.imageUrl}
                    title={t(item.name, locale)}
                    body={t(item.overview, locale)}
                  />
                ))}
              </div>
            )}
          </div>
        </PageShell>
      ) : null}
    </>
  );
}
