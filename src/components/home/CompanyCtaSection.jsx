import React from "react";
import CtaLink from "@/components/ui/CtaLink";
import { useLocale } from "@/context/LocaleContext";
import { t } from "@/lib/i18n";

export default function CompanyCtaSection({ section }) {
  const { locale } = useLocale();
  const data = section?.data;
  const title = t(data?.title, locale);
  const body = t(data?.body, locale);
  const ctaLabel = t(data?.cta?.label, locale);
  const href = data?.cta?.href;
  const imageUrl = data?.imageUrl;

  if (!title && !body && !imageUrl) return null;

  return (
    <section className="bg-white py-16 lg:py-20">
      <div className="container mx-auto grid items-center gap-10 px-4 lg:grid-cols-2 lg:px-8">
        {imageUrl ? (
          <div className="overflow-hidden rounded-3xl">
            <img src={imageUrl} alt={title} className="h-full w-full object-cover" />
          </div>
        ) : null}
        <div>
          {title ? (
            <h2 className="mb-4 text-3xl font-extrabold text-brand-ink">{title}</h2>
          ) : null}
          {body ? (
            <p className="mb-7 whitespace-pre-wrap text-sm leading-8 text-text-muted sm:text-base">
              {body}
            </p>
          ) : null}
          {href && ctaLabel ? (
            <CtaLink
              href={href}
              className="inline-flex rounded-full bg-brand-black px-7 py-3 text-sm font-extrabold text-white transition-colors hover:bg-brand-forest"
            >
              {ctaLabel}
            </CtaLink>
          ) : null}
        </div>
      </div>
    </section>
  );
}
