import React from "react";
import { Link } from "react-router-dom";
import SectionHeader from "@/components/ui/SectionHeader";
import { EmptyState } from "@/components/ui/StatusMessage";
import { useLocale } from "@/context/LocaleContext";
import { t } from "@/lib/i18n";

export default function ProductCategoriesSection({ section }) {
  const { locale } = useLocale();
  const title = t(section?.data?.title, locale);
  const body = t(section?.data?.body, locale);
  const items = section?.items || [];

  return (
    <section className="bg-surface-muted py-16 lg:py-20">
      <div className="container mx-auto px-4 lg:px-8">
        <SectionHeader title={title} body={body} />
        {items.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item) => (
              <Link
                key={item.id}
                to={`/products?section=${encodeURIComponent(item.id)}`}
                className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm transition-transform hover:-translate-y-1 hover:border-brand-lime"
              >
                <h3 className="text-lg font-extrabold text-brand-ink">
                  {t(item.name, locale)}
                </h3>
                {item.subcategories?.length ? (
                  <p className="mt-2 text-sm text-text-muted">
                    {item.subcategories
                      .slice(0, 3)
                      .map((sub) => t(sub.name, locale))
                      .filter(Boolean)
                      .join(" • ")}
                  </p>
                ) : null}
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
