import React from "react";
import { Link } from "react-router-dom";
import Reveal from "@/components/ui/Reveal";
import { EmptyState } from "@/components/ui/StatusMessage";
import { useLocale } from "@/context/LocaleContext";
import { t } from "@/lib/i18n";

export default function ProductCategoriesSection({ section }) {
  const { locale } = useLocale();
  const title = t(section?.data?.title, locale);
  const body = t(section?.data?.body, locale);
  const items = section?.items || [];

  return (
    <section className="relative overflow-hidden bg-white py-16 lg:py-24">
      {title ? (
        <div
          className="pointer-events-none absolute inset-x-0 top-8 select-none text-center text-[4.5rem] font-black uppercase leading-none tracking-[0.08em] text-brand-ink/[0.05] sm:top-10 sm:text-[7rem] lg:text-[9rem]"
          aria-hidden="true"
        >
          {title}
        </div>
      ) : null}

      <div className="relative container mx-auto px-4 lg:px-8">
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {items.map((item, itemIndex) => {
              const name = t(item.name, locale);
              return (
                <Reveal key={item.id} delay={itemIndex * 0.06}>
                  <Link
                    to={`/products?section=${encodeURIComponent(item.id)}`}
                    className="group relative block aspect-[3/4] overflow-hidden bg-brand-forest"
                  >
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={name}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                        loading="lazy"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-brand-moss to-brand-forest-deep" />
                    )}
                    <div
                      className="absolute inset-0 bg-gradient-to-t from-brand-black/80 via-brand-black/25 to-brand-black/35"
                      aria-hidden="true"
                    />
                    <div className="absolute inset-x-0 top-0 p-5 sm:p-6">
                      <h3 className="text-lg font-extrabold uppercase tracking-[0.08em] text-white sm:text-xl">
                        {name}
                      </h3>
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
