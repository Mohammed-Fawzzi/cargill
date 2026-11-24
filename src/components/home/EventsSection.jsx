import React from "react";
import { Link } from "react-router-dom";
import StoriesCarousel from "@/components/ui/StoriesCarousel";
import MagneticButton from "@/components/ui/MagneticButton";
import Reveal from "@/components/ui/Reveal";
import { EmptyState } from "@/components/ui/StatusMessage";
import { useLocale } from "@/context/LocaleContext";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";

export default function EventsSection({ section }) {
  const { locale } = useLocale();
  const items = section?.items || [];
  const title = t(section?.data?.title, locale);
  const body = t(section?.data?.body, locale);

  return (
    <section className="relative overflow-hidden bg-white py-16 lg:py-24">
      <div
        className="pointer-events-none absolute -end-16 top-20 h-56 w-56 rounded-full bg-brand-lime/15 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -start-10 bottom-10 h-48 w-48 rounded-full bg-brand-moss/10 blur-3xl"
        aria-hidden="true"
      />
      <div className="relative container mx-auto px-4 lg:px-8">
        <Reveal className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end lg:mb-14">
          <div className="max-w-2xl">
            {title ? (
              <h2 className="mb-3 text-3xl font-extrabold tracking-tight text-brand-ink sm:text-4xl lg:text-[2.75rem]">
                {title}
              </h2>
            ) : null}
            {body ? (
              <p className="text-sm leading-8 text-text-muted sm:text-base">{body}</p>
            ) : null}
          </div>
          <MagneticButton>
            <Link
              to="/events"
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-brand-ink/15 px-6 text-sm font-bold text-brand-ink transition-all duration-300 hover:border-brand-lime hover:bg-brand-lime"
            >
              {t(UI.viewAll, locale)}
            </Link>
          </MagneticButton>
        </Reveal>

        {items.length === 0 ? (
          <EmptyState />
        ) : (
          <Reveal delay={0.08}>
            <StoriesCarousel
              items={items}
              getTitle={(item, currentLocale) => t(item.title, currentLocale)}
              getBody={(item, currentLocale) => t(item.details, currentLocale)}
              getHref={(item) => `/events/${item.id}`}
              getImage={(item) => item.imageUrl}
            />
          </Reveal>
        )}
      </div>
    </section>
  );
}
