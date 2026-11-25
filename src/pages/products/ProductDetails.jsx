import React, { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, useReducedMotion } from "framer-motion";
import Seo from "@/components/seo/Seo";
import Loading from "@/components/loading/Loading";
import Reveal from "@/components/ui/Reveal";
import SafeImage from "@/components/ui/SafeImage";
import ContentGrid, { cardLayoutForCount } from "@/components/ui/ContentGrid";
import { PrimaryButton, SecondaryButton } from "@/components/ui/AppButton";
import { TriangleAccent } from "@/components/ui/TriangleMask";
import ProductCard from "@/components/products/ProductCard";
import { EmptyState, ErrorState } from "@/components/ui/StatusMessage";
import { getCategories, getProduct, getProducts } from "@/services/cms/products";
import { useLocale } from "@/context/LocaleContext";
import { useSiteData } from "@/context/SiteDataContext";
import { toWhatsAppHref } from "@/lib/phone";
import { easeOut } from "@/lib/motion";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";

function columnLabel(column, locale) {
  if (column?.id === "phi") return t(UI.phiLabel, locale);
  return t(column?.name, locale);
}

function UsageTable({ columns, rows, locale }) {
  if (!columns?.length || !rows?.length) return null;

  return (
    <>
      <div className="hidden md:block">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b-2 border-brand-ink">
              {columns.map((col) => (
                <th
                  key={col.id}
                  className="px-3 py-3 text-start text-xs font-medium text-text-muted"
                >
                  {columnLabel(col, locale)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-brand-ink/10 transition-colors hover:bg-surface-muted"
              >
                {columns.map((col) => {
                  const value = t(row.cells?.[col.id], locale);
                  const isDose = col.id === "dose";
                  return (
                    <td
                      key={col.id}
                      className={`px-3 py-4 align-top ${
                        isDose
                          ? "font-bold text-brand-ink"
                          : "text-text-muted"
                      }`}
                    >
                      {value}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-4 md:hidden">
        {rows.map((row) => {
          const cropCol = columns.find((col) => col.id === "crop") || columns[0];
          const title = t(row.cells?.[cropCol?.id], locale);
          const rest = columns.filter((col) => col.id !== cropCol?.id);
          return (
            <article
              key={row.id}
              className="border-b border-brand-ink/15 pb-4"
            >
              {title ? (
                <h3 className="mb-3 text-base font-extrabold text-brand-ink">
                  {title}
                </h3>
              ) : null}
              <dl className="space-y-2">
                {rest.map((col) => {
                  const value = t(row.cells?.[col.id], locale);
                  if (!value) return null;
                  return (
                    <div
                      key={col.id}
                      className="flex items-baseline justify-between gap-4"
                    >
                      <dt className="text-xs text-text-muted">
                        {columnLabel(col, locale)}
                      </dt>
                      <dd
                        className={`text-sm ${
                          col.id === "dose"
                            ? "font-bold text-brand-ink"
                            : "text-brand-ink"
                        }`}
                      >
                        {value}
                      </dd>
                    </div>
                  );
                })}
              </dl>
            </article>
          );
        })}
      </div>
    </>
  );
}

export default function ProductDetails() {
  const { id } = useParams();
  const { locale } = useLocale();
  const { contact } = useSiteData();
  const reduceMotion = useReducedMotion();
  const [activeImage, setActiveImage] = useState(0);

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
  const origin = t(product?.originCountry, locale);
  const categoryName = t(section?.name, locale);
  const subcategoryName = t(subcategory?.name, locale);
  const overview = t(product?.overview, locale);
  const details = t(product?.details, locale);
  const packaging =
    t(product?.packaging, locale) ||
    t(product?.packageSize, locale) ||
    "";
  const datasheetUrl =
    product?.datasheetUrl || product?.pdfUrl || product?.technicalSheetUrl || "";

  const images = useMemo(() => {
    const gallery = Array.isArray(product?.images)
      ? product.images.filter(Boolean)
      : [];
    if (gallery.length) return gallery;
    return product?.imageUrl ? [product.imageUrl] : [];
  }, [product]);

  const composition = product?.activeIngredients || [];
  const compositionSummary = composition
    .map((item) =>
      [t(item.name, locale), item.percentage].filter(Boolean).join(" — "),
    )
    .filter(Boolean)
    .join(" · ");

  const facts = [
    categoryName
      ? { label: t(UI.categoryFact, locale), value: categoryName }
      : null,
    compositionSummary
      ? { label: t(UI.ingredients, locale), value: compositionSummary }
      : null,
    origin ? { label: t(UI.originShort, locale), value: origin } : null,
    packaging ? { label: t(UI.packaging, locale), value: packaging } : null,
  ].filter(Boolean);

  const related = useMemo(() => {
    const list = productsQuery.data || [];
    return list
      .filter(
        (item) =>
          item.id !== id &&
          product?.sectionId &&
          item.sectionId === product.sectionId,
      )
      .slice(0, 3);
  }, [productsQuery.data, id, product?.sectionId]);

  const relatedLayout = cardLayoutForCount(related.length);
  const phone = contact?.phones?.[0] || "";
  const waMessage = t(UI.askAboutProductMessage, locale).replace(
    "{name}",
    name || "",
  );
  const waHref = toWhatsAppHref(phone, waMessage);

  const crumbs = [
    { label: t(UI.nav.products, locale), to: "/products" },
    categoryName
      ? {
          label: categoryName,
          to: product?.sectionId
            ? `/products?section=${product.sectionId}`
            : "/products",
        }
      : null,
    subcategoryName ? { label: subcategoryName } : null,
  ].filter(Boolean);

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
        <main className="min-h-screen bg-white pb-28 md:pb-0">
          <section className="pt-[140px]">
            <div className="container mx-auto px-4 lg:px-8">
              <motion.div
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, ease: easeOut }}
              >
                <nav
                  aria-label="Breadcrumb"
                  className="mb-4 text-sm text-text-muted"
                >
                  <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    {crumbs.map((item, index) => {
                      const last = index === crumbs.length - 1;
                      return (
                        <li
                          key={`${item.label}-${index}`}
                          className="flex items-center gap-2"
                        >
                          {index > 0 ? (
                            <span className="text-brand-ink/30" aria-hidden="true">
                              /
                            </span>
                          ) : null}
                          {item.to && !last ? (
                            <Link
                              to={item.to}
                              className="transition-colors hover:text-brand-ink"
                            >
                              {item.label}
                            </Link>
                          ) : (
                            <span className={last ? "text-brand-ink/70" : undefined}>
                              {item.label}
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ol>
                </nav>

                <SecondaryButton to="/products" className="mb-8">
                  {t(UI.backToAllProducts, locale)}
                </SecondaryButton>

                <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
                  <div className="order-2 lg:order-1 lg:col-span-6">
                    {name ? (
                      <h1 className="text-[clamp(2.25rem,5vw,4.5rem)] font-extrabold leading-[0.98] tracking-tight text-brand-ink">
                        {name}
                      </h1>
                    ) : null}
                    {overview ? (
                      <p className="mt-5 max-w-xl text-base leading-8 text-text-muted sm:text-lg sm:leading-9">
                        {overview}
                      </p>
                    ) : null}

                    {facts.length ? (
                      <dl className="mt-8 border-t border-brand-ink/15">
                        {facts.map((fact) => (
                          <div
                            key={fact.label}
                            className="grid grid-cols-[7.5rem_1fr] gap-4 border-b border-brand-ink/15 py-3.5 sm:grid-cols-[9rem_1fr]"
                          >
                            <dt className="text-xs font-semibold text-text-muted">
                              {fact.label}
                            </dt>
                            <dd className="text-sm font-semibold leading-6 text-brand-ink">
                              {fact.value}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    ) : null}

                    <div className="mt-8 hidden flex-wrap items-center gap-5 md:flex">
                      {waHref ? (
                        <PrimaryButton href={waHref}>
                          {t(UI.askAboutProductWa, locale)}
                        </PrimaryButton>
                      ) : null}
                      {datasheetUrl ? (
                        <SecondaryButton href={datasheetUrl}>
                          {t(UI.downloadDatasheet, locale)}
                        </SecondaryButton>
                      ) : null}
                    </div>
                  </div>

                  <div className="order-1 lg:order-2 lg:col-span-6">
                    <div className="relative overflow-hidden rounded-lg bg-surface-muted">
                      <TriangleAccent className="absolute end-4 top-4 z-10 h-3.5 w-4" />
                      {images[activeImage] ? (
                        <motion.div
                          key={images[activeImage]}
                          initial={reduceMotion ? false : { opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.25, ease: easeOut }}
                        >
                          <SafeImage
                            src={images[activeImage]}
                            alt={name}
                            className="aspect-[4/3] w-full object-contain p-6 sm:p-10"
                          />
                        </motion.div>
                      ) : (
                        <div className="flex aspect-[4/3] items-center justify-center px-6 text-center text-brand-ink/40">
                          {name}
                        </div>
                      )}
                    </div>
                    {images.length > 1 ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {images.map((src, index) => (
                          <button
                            key={`${src}-${index}`}
                            type="button"
                            onClick={() => setActiveImage(index)}
                            aria-label={`${name} ${index + 1}`}
                            className={`overflow-hidden rounded-md bg-surface-muted p-1.5 ${
                              activeImage === index
                                ? "ring-2 ring-brand-lime"
                                : "ring-1 ring-brand-ink/10"
                            }`}
                          >
                            <SafeImage
                              src={src}
                              alt=""
                              className="h-14 w-14 object-contain"
                              aria-hidden="true"
                            />
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          <div className="container mx-auto space-y-14 px-4 py-14 lg:px-8 lg:py-16">
            {composition.length ? (
              <Reveal>
                <h2 className="mb-6 text-2xl font-extrabold text-brand-ink">
                  {t(UI.composition, locale)}
                </h2>
                <ul className="grid gap-0 sm:grid-cols-2 sm:gap-x-10">
                  {composition.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-end justify-between gap-4 border-b border-brand-ink/15 py-5"
                    >
                      <span className="text-base font-semibold text-brand-ink">
                        {t(item.name, locale)}
                      </span>
                      {item.percentage ? (
                        <span className="text-[40px] font-extrabold leading-none tracking-tight text-brand-ink">
                          {item.percentage}
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </Reveal>
            ) : null}

            {product.features?.length ? (
              <Reveal>
                <h2 className="mb-6 text-2xl font-extrabold text-brand-ink">
                  {t(UI.productHighlights, locale)}
                </h2>
                <ul
                  className={`grid gap-0 ${
                    product.features.length > 4 ? "lg:grid-cols-2 lg:gap-x-12" : ""
                  }`}
                >
                  {product.features.map((item, index) => (
                    <li
                      key={item.id}
                      className="flex gap-4 border-b border-brand-ink/15 py-5"
                    >
                      <span className="shrink-0 text-sm font-bold tracking-wide text-brand-lime">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <p className="text-[20px] font-semibold leading-8 text-brand-ink">
                        {t(item.text, locale)}
                      </p>
                    </li>
                  ))}
                </ul>
              </Reveal>
            ) : null}

            {details ? (
              <Reveal>
                <h2 className="mb-4 text-2xl font-extrabold text-brand-ink">
                  {t(UI.details, locale)}
                </h2>
                <p className="whitespace-pre-wrap text-base leading-9 text-text-muted sm:text-lg">
                  {details}
                </p>
              </Reveal>
            ) : null}

            {product.agriculturalUses?.length ? (
              <Reveal>
                <h2 className="mb-6 text-2xl font-extrabold text-brand-ink">
                  {t(UI.usage, locale)}
                </h2>
                <UsageTable
                  columns={product.agriculturalColumns}
                  rows={product.agriculturalUses}
                  locale={locale}
                />
                <p className="mt-5 text-xs leading-6 text-text-muted">
                  {t(UI.usageNote, locale)}
                </p>
              </Reveal>
            ) : null}
          </div>

          {related.length > 0 ? (
            <section className="border-t border-brand-ink/10 py-14 lg:py-16">
              <div className="container mx-auto px-4 lg:px-8">
                <Reveal className="mb-8">
                  <h2 className="text-2xl font-extrabold text-brand-ink sm:text-3xl">
                    {t(UI.relatedSameCategory, locale)}
                  </h2>
                </Reveal>
                <ContentGrid count={related.length}>
                  {related.map((item, index) => {
                    const category = categories.find(
                      (entry) => entry.id === item.sectionId,
                    );
                    const sub = category?.subcategories?.find(
                      (entry) => entry.id === item.subcategoryId,
                    );
                    return (
                      <Reveal key={item.id} delay={Math.min(index * 0.05, 0.15)}>
                        <ProductCard
                          to={`/products/${item.id}`}
                          imageUrl={item.imageUrl}
                          title={t(item.name, locale)}
                          subcategory={t(sub?.name, locale)}
                          origin={t(item.originCountry, locale)}
                          layout={relatedLayout}
                        />
                      </Reveal>
                    );
                  })}
                </ContentGrid>
              </div>
            </section>
          ) : null}

          {waHref ? (
            <div className="fixed inset-x-0 bottom-0 z-30 border-t border-brand-ink/15 bg-white p-3 md:hidden">
              <PrimaryButton href={waHref} className="w-full">
                {t(UI.askAboutProductWa, locale)}
              </PrimaryButton>
            </div>
          ) : null}
        </main>
      ) : null}
    </>
  );
}
