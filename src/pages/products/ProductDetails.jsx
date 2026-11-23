import React from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Seo from "@/components/seo/Seo";
import Loading from "@/components/loading/Loading";
import { EmptyState, ErrorState, PageShell } from "@/components/ui/StatusMessage";
import { getCategories, getProduct } from "@/services/cms/products";
import { useLocale } from "@/context/LocaleContext";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";

function UsageTable({ columns, rows, locale }) {
  if (!columns?.length || !rows?.length) return null;
  return (
    <div className="overflow-x-auto rounded-2xl border border-black/5">
      <table className="min-w-full text-sm">
        <thead className="bg-brand-forest text-white">
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
  const productQuery = useQuery({
    queryKey: ["cms", "product", id],
    queryFn: () => getProduct(id),
    enabled: Boolean(id),
  });
  const categoriesQuery = useQuery({
    queryKey: ["cms", "categories"],
    queryFn: getCategories,
  });

  const product = productQuery.data;
  const categories = categoriesQuery.data || [];
  const section = categories.find((item) => item.id === product?.sectionId);
  const subcategory = section?.subcategories?.find(
    (item) => item.id === product?.subcategoryId,
  );
  const name = t(product?.name, locale);

  return (
    <>
      <Seo title={name || t(UI.nav.products, locale)} path={`/products/${id}`} />
      {productQuery.isPending ? <Loading /> : null}
      {!productQuery.isPending && productQuery.isError ? (
        <ErrorState onRetry={productQuery.refetch} />
      ) : null}
      {!productQuery.isPending && !productQuery.isError && !product ? (
        <PageShell>
          <EmptyState message={t(UI.missingProduct, locale)} />
        </PageShell>
      ) : null}
      {!productQuery.isPending && product ? (
        <PageShell>
          <div className="container mx-auto grid gap-10 px-4 py-12 lg:grid-cols-2 lg:px-8">
            <div className="overflow-hidden rounded-3xl bg-surface-muted">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={name} className="h-full w-full object-cover" />
              ) : null}
            </div>
            <div>
              <p className="mb-2 text-sm font-bold text-brand-moss">
                {[t(section?.name, locale), t(subcategory?.name, locale)]
                  .filter(Boolean)
                  .join(" / ")}
              </p>
              <h1 className="mb-4 text-3xl font-extrabold text-brand-ink">{name}</h1>
              {t(product.originCountry, locale) ? (
                <p className="mb-4 text-sm text-text-muted">
                  {t(UI.origin, locale)}: {t(product.originCountry, locale)}
                </p>
              ) : null}
              {t(product.overview, locale) ? (
                <p className="whitespace-pre-wrap leading-8 text-text-muted">
                  {t(product.overview, locale)}
                </p>
              ) : null}
            </div>
          </div>

          <div className="container mx-auto space-y-10 px-4 pb-16 lg:px-8">
            {t(product.details, locale) ? (
              <section>
                <h2 className="mb-3 text-xl font-extrabold">{t(UI.details, locale)}</h2>
                <p className="whitespace-pre-wrap leading-8 text-text-muted">
                  {t(product.details, locale)}
                </p>
              </section>
            ) : null}

            {product.activeIngredients?.length ? (
              <section>
                <h2 className="mb-3 text-xl font-extrabold">
                  {t(UI.ingredients, locale)}
                </h2>
                <ul className="space-y-2">
                  {product.activeIngredients.map((item) => (
                    <li key={item.id} className="rounded-xl bg-surface-muted px-4 py-3">
                      {t(item.name, locale)}
                      {item.percentage ? ` — ${item.percentage}` : ""}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {product.features?.length ? (
              <section>
                <h2 className="mb-3 text-xl font-extrabold">{t(UI.features, locale)}</h2>
                <ul className="list-disc space-y-2 ps-5 text-text-muted">
                  {product.features.map((item) => (
                    <li key={item.id}>{t(item.text, locale)}</li>
                  ))}
                </ul>
              </section>
            ) : null}

            {product.agriculturalUses?.length ? (
              <section>
                <h2 className="mb-3 text-xl font-extrabold">{t(UI.usage, locale)}</h2>
                <UsageTable
                  columns={product.agriculturalColumns}
                  rows={product.agriculturalUses}
                  locale={locale}
                />
              </section>
            ) : null}

            <Link
              to="/products"
              className="inline-flex font-bold text-brand-moss hover:text-brand-lime"
            >
              {t(UI.nav.products, locale)}
            </Link>
          </div>
        </PageShell>
      ) : null}
    </>
  );
}
