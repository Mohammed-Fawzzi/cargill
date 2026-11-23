import React from "react";
import StoriesCarousel from "@/components/ui/StoriesCarousel";
import Reveal from "@/components/ui/Reveal";
import { EmptyState } from "@/components/ui/StatusMessage";
import { useLocale } from "@/context/LocaleContext";
import { t } from "@/lib/i18n";

export default function ArticlesSection({ section }) {
  const { locale } = useLocale();
  const items = section?.items || [];
  const title = t(section?.data?.title, locale);
  const body = t(section?.data?.body, locale);

  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="container mx-auto px-4 lg:px-8">
        <Reveal className="mb-10 text-center lg:mb-14">
          {title ? (
            <h2 className="mb-3 text-3xl font-extrabold text-brand-ink sm:text-4xl">
              {title}
            </h2>
          ) : null}
          {body ? (
            <p className="mx-auto max-w-2xl text-sm leading-8 text-text-muted sm:text-base">
              {body}
            </p>
          ) : null}
        </Reveal>

        {items.length === 0 ? (
          <EmptyState />
        ) : (
          <Reveal delay={0.08}>
            <StoriesCarousel
              items={items}
              getTitle={(item, currentLocale) => t(item.title, currentLocale)}
              getBody={(item, currentLocale) => t(item.excerpt, currentLocale)}
              getHref={(item) => `/articles/${item.id}`}
              getImage={(item) => item.imageUrl}
            />
          </Reveal>
        )}
      </div>
    </section>
  );
}
