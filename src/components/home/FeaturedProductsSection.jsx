import React from "react";
import SectionHeader from "@/components/ui/SectionHeader";
import MediaCard from "@/components/ui/MediaCard";
import CtaLink from "@/components/ui/CtaLink";
import { EmptyState } from "@/components/ui/StatusMessage";
import { useLocale } from "@/context/LocaleContext";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";

export default function FeaturedProductsSection({ section }) {
  const { locale } = useLocale();
  const title = t(section?.data?.title, locale);
  const body = t(section?.data?.body, locale);
  const items = section?.items || [];

  return (
    <section className="bg-surface-muted py-16 lg:py-20">
      <div className="container mx-auto px-4 lg:px-8">
        <SectionHeader
          title={title}
          body={body}
          action={
            <CtaLink
              href="/products"
              className="text-sm font-bold text-brand-moss hover:text-brand-lime"
            >
              {t(UI.viewAll, locale)}
            </CtaLink>
          }
        />
        {items.length === 0 ? (
          <EmptyState />
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
    </section>
  );
}
