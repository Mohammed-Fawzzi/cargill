import React, { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Seo from "@/components/seo/Seo";
import Loading from "@/components/loading/Loading";
import Reveal from "@/components/ui/Reveal";
import SafeImage from "@/components/ui/SafeImage";
import ProductCard from "@/components/products/ProductCard";
import { EmptyState, ErrorState } from "@/components/ui/StatusMessage";
import MagneticButton from "@/components/ui/MagneticButton";
import { getCategories, getProduct, getProducts } from "@/services/cms/products";
import { useHomepageSection } from "@/hooks/useHomepageSection";
import { useLocale } from "@/context/LocaleContext";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";
import { easeOut } from "@/lib/motion";

function UsageTable({ columns, rows, locale }) {
  if (!columns?.length || !rows?.length) return null;
  return (
    <div className="overflow-x-auto rounded-2xl border border-black/5 shadow-[0_10px_30px_rgba(24,16,96,0.05)]">
      <table className="min-w-full text-sm">
        <thead className="bg-brand-forest-deep text-white">
          <tr>
            {columns.map((col) => (
              <th key={col.id} className="px-4 py-3 text-start font-bold">
                {t(col.name, locale)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="odd:bg-white even:bg-surface-muted">
              {columns.map((col) => (
                <td key={col.id} className="px-4 py-3 text-text-muted">
                  {t(row.cells?.[col.id], locale)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ProductDetails() {
  const { id } = useParams();
  const { locale } = useLocale();
  const featuredQuery = useHomepageSection("featured_products");
  const productQuery = useQuery({
    queryKey: ["cms", "product", id],
    queryFn: () => getProduct(id),
    enabled: Boolean(id),
  });
  const categoriesQuery = useQuery({
    queryKey: ["cms", "categories"],
    queryFn: getCategories,
  });
  const productsQuery = useQuery({
    queryKey: ["cms", "products"],
    queryFn: getProducts,
    staleTime: 1000 * 60 * 2,
  });

  const product = productQuery.data;
  const categories = categoriesQuery.data || [];
  const section = categories.find((item) => item.id === product?.sectionId);
  const subcategory = section?.subcategories?.find(
    (item) => item.id === product?.subcategoryId,
  );
  const name = t(product?.name, locale);
  const relatedTitle =
    t(featuredQuery.data?.title, locale) || t(UI.nav.products, locale);
  const origin = t(product?.originCountry, locale);
  const firstIngredient = product?.activeIngredients?.[0]
    ? [
        t(product.activeIngredients[0].name, locale),
        product.activeIngredients[0].percentage,
      ]
        .filter(Boolean)
        .join(" — ")
    : "";
  const cropColumn = product?.agriculturalColumns?.find((col) => col.id === "crop");
  const crops = useMemo(() => {
    if (!product?.agriculturalUses?.length || !cropColumn) return [];
    return [
      ...new Set(
        product.agriculturalUses
          .map((row) => t(row.cells?.[cropColumn.id], locale))
          .filter(Boolean),
      ),
    ];
  }, [product?.agriculturalUses, cropColumn, locale]);

  const specs = [
    origin ? { label: t(UI.origin, locale), value: origin } : null,
    firstIngredient
      ? { label: t(UI.ingredients, locale), value: firstIngredient }
      : null,
    t(section?.name, locale)
      ? { label: t(UI.relatedCategory, locale), value: t(section?.name, locale) }
      : null,
    crops.length
      ? {
          label: t(UI.cropsCovered, locale),
          value: String(crops.length),
        }
      : null,
  ].filter(Boolean);

  const related = useMemo(() => {
    const list = productsQuery.data || [];
    const selected = featuredQuery.data?.selectedIds || [];
    const byId = new Map(list.map((item) => [item.id, item]));
    const preferred = selected
      .map((itemId) => byId.get(itemId))
      .filter((item) => item && item.id !== id);
    if (preferred.length) return preferred.slice(0, 3);
    return list
      .filter((item) => item.id !== id && item.sectionId === product?.sectionId)
      .slice(0, 3);
  }, [productsQuery.data, featuredQuery.data?.selectedIds, id, product?.sectionId]);

  return (
    <>
      <Seo title={name || t(UI.nav.products, locale)} path={`/products/${id}`} />
      {productQuery.isPending ? <Loading /> : null}
      {!productQuery.isPending && productQuery.isError ? (
        <ErrorState onRetry={productQuery.refetch} />
      ) : null}
      {!productQuery.isPending && !productQuery.isError && !product ? (
        <main className="pt-navbar min-h-screen bg-white">
          <EmptyState message={t(UI.missingProduct, locale)} />
        </main>
      ) : null}
      {!productQuery.isPending && product ? (
        <main className="min-h-screen bg-white pb-24 md:pb-0">
          <section className="relative overflow-hidden bg-brand-forest-deep pt-[calc(var(--navbar-height)+1.5rem)] text-white">
            <div className="container mx-auto grid items-center gap-10 px-4 py-12 lg:grid-cols-2 lg:gap-14 lg:px-8 lg:py-16">
              <motion.div
                className="relative overflow-hidden rounded-[1.75rem] bg-white/5 shadow-[0_24px_60px_rgba(0,0,0,0.28)] ring-1 ring-white/10"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: easeOut }}
              >
                {product.imageUrl ? (
                  <SafeImage
                    src={product.imageUrl}
                    alt={name}
                    className="aspect-[4/3] h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-[4/3] items-center justify-center text-brand-lime">
                    {name}
                  </div>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: easeOut, delay: 0.06 }}
              >
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-brand-lime">
                  {[t(section?.name, locale), t(subcategory?.name, locale)]
                    .filter(Boolean)
                    .join(" / ")}
                </p>
                <h1 className="mb-5 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                  {name}
                </h1>
                {t(product.overview, locale) ? (
                  <p className="mb-8 whitespace-pre-wrap text-base leading-8 text-white/85 sm:text-lg sm:leading-9">
                    {t(product.overview, locale)}
                  </p>
                ) : null}
                <MagneticButton className="inline-flex">
                  <Link
                    to="/contact"
                    className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-md bg-brand-lime px-7 py-3 text-sm font-extrabold text-brand-ink transition-all hover:bg-brand-lime-hover"
                  >
                    {t(UI.imInterested, locale)}
                  </Link>
                </MagneticButton>
              </motion.div>
            </div>
          </section>

          {specs.length ? (
            <section className="relative z-10 -mt-6 px-4 lg:px-8">
              <div className="container mx-auto overflow-hidden rounded-2xl border border-brand-ink/8 bg-white shadow-[0_18px_44px_rgba(24,16,96,0.1)]">
                <div className="grid grid-cols-2 divide-x divide-brand-ink/8 rtl:divide-x-reverse md:grid-cols-4">
                  {specs.map((item) => (
                    <div key={item.label} className="px-4 py-5 text-center sm:px-6 sm:py-6">
                      <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.16em] text-brand-moss">
                        {item.label}
                      </p>
                      <p className="text-sm font-extrabold leading-6 text-brand-ink sm:text-base">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ) : null}

          <div className="container mx-auto space-y-12 px-4 py-14 lg:px-8 lg:py-16">
            {t(product.details, locale) ? (
              <Reveal>
                <h2 className="mb-4 text-2xl font-extrabold text-brand-ink">
                  {t(UI.details, locale)}
                </h2>
                <p className="whitespace-pre-wrap text-base leading-9 text-text-muted sm:text-lg">
                  {t(product.details, locale)}
                </p>
              </Reveal>
            ) : null}

            {product.activeIngredients?.length ? (
              <Reveal>
                <h2 className="mb-4 text-2xl font-extrabold text-brand-ink">
                  {t(UI.ingredients, locale)}
                </h2>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {product.activeIngredients.map((item) => (
                    <li
                      key={item.id}
                      className="rounded-2xl border border-brand-ink/5 bg-surface-muted px-5 py-4 text-brand-ink"
                    >
                      {t(item.name, locale)}
                      {item.percentage ? ` — ${item.percentage}` : ""}
                    </li>
                  ))}
                </ul>
              </Reveal>
            ) : null}

            {product.features?.length ? (
              <Reveal>
                <h2 className="mb-8 text-2xl font-extrabold text-brand-ink">
                  {t(UI.productHighlights, locale)}
                </h2>
                <div className="grid gap-5 sm:grid-cols-2">
                  {product.features.map((item, index) => (
                    <article
                      key={item.id}
                      className="rounded-[1.5rem] border border-brand-ink/8 bg-white p-6 shadow-[0_10px_30px_rgba(24,16,96,0.04)]"
                    >
                      <p className="mb-3 text-3xl font-extrabold tracking-tight text-brand-lime">
                        {String(index + 1).padStart(2, "0")}.
                      </p>
                      <p className="text-base font-semibold leading-8 text-brand-ink">
                        {t(item.text, locale)}
                      </p>
                    </article>
                  ))}
                </div>
              </Reveal>
            ) : null}

            {product.agriculturalUses?.length ? (
              <Reveal>
                <h2 className="mb-4 text-2xl font-extrabold text-brand-ink">
                  {t(UI.usage, locale)}
                </h2>
                <UsageTable
                  columns={product.agriculturalColumns}
                  rows={product.agriculturalUses}
                  locale={locale}
                />
              </Reveal>
            ) : null}

            <Reveal>
              <Link
                to="/products"
                className="inline-flex cursor-pointer font-bold text-brand-moss transition-colors hover:text-brand-lime"
              >
                ← {t(UI.nav.products, locale)}
              </Link>
            </Reveal>
          </div>

          {related.length > 0 ? (
            <section className="border-t border-black/5 bg-surface-muted py-14 lg:py-16">
              <div className="container mx-auto px-4 lg:px-8">
                <Reveal className="mb-8">
                  <h2 className="text-2xl font-extrabold text-brand-ink sm:text-3xl">
                    {relatedTitle}
                  </h2>
                </Reveal>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
                  {related.map((item, index) => {
                    const category = categories.find((c) => c.id === item.sectionId);
                    const sub = category?.subcategories?.find(
                      (s) => s.id === item.subcategoryId,
                    );
                    return (
                      <Reveal key={item.id} delay={Math.min(index * 0.05, 0.15)}>
                        <ProductCard
                          to={`/products/${item.id}`}
                          imageUrl={item.imageUrl}
                          title={t(item.name, locale)}
                          category={t(category?.name, locale)}
                          subcategory={t(sub?.name, locale)}
                          origin={t(item.originCountry, locale)}
                        />
                      </Reveal>
                    );
                  })}
                </div>
              </div>
            </section>
          ) : null}
        </main>
      ) : null}
    </>
  );
}
