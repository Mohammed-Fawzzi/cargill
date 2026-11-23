import React from "react";
import SectionHeader from "@/components/ui/SectionHeader";
import MediaCard from "@/components/ui/MediaCard";
import CtaLink from "@/components/ui/CtaLink";
import { EmptyState } from "@/components/ui/StatusMessage";
import { useLocale } from "@/context/LocaleContext";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";
import { formatMillis } from "@/lib/time";

export default function ArticlesSection({ section }) {
  const { locale } = useLocale();
  const items = section?.items || [];

  return (
    <section className="bg-white py-16 lg:py-20">
      <div className="container mx-auto px-4 lg:px-8">
        <SectionHeader
          title={t(section?.data?.title, locale)}
          body={t(section?.data?.body, locale)}
          action={
            <CtaLink
              href="/articles"
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
                to={`/articles/${item.id}`}
                imageUrl={item.imageUrl}
                title={t(item.title, locale)}
                body={t(item.excerpt, locale)}
                meta={formatMillis(item.createdAt, locale)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
