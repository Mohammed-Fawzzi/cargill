import React from "react";
import { Link } from "react-router-dom";
import TiltCard from "@/components/ui/TiltCard";
import SafeImage from "@/components/ui/SafeImage";
import { useLocale } from "@/context/LocaleContext";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";

export default function ProductCard({
  to,
  imageUrl,
  title,
  category,
  subcategory,
  origin,
}) {
  const { locale } = useLocale();
  const meta = [category, subcategory].filter(Boolean).join(" • ");

  return (
    <TiltCard className="h-full">
      <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-black/8 bg-white shadow-[0_8px_28px_rgba(24,16,96,0.05)] transition-shadow duration-300 hover:shadow-[0_22px_48px_rgba(24,16,96,0.12)]">
        <Link to={to} className="flex h-full flex-col">
          <div className="relative aspect-[4/3] overflow-hidden bg-surface-muted">
            {imageUrl ? (
              <SafeImage
                src={imageUrl}
                alt={title}
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-brand-forest text-brand-lime">
                {title}
              </div>
            )}
            <div
              className="absolute inset-0 bg-gradient-to-t from-brand-forest-deep/35 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              aria-hidden="true"
            />
            <div
              className="absolute inset-x-0 top-0 h-1 origin-start scale-x-0 bg-brand-lime transition-transform duration-500 group-hover:scale-x-100"
              aria-hidden="true"
            />
          </div>
          <div className="flex flex-1 flex-col p-5 sm:p-6">
            {meta ? (
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-brand-moss">
                {meta}
              </p>
            ) : null}
            {title ? (
              <h3 className="mb-2 text-lg font-extrabold leading-7 text-brand-ink transition-colors group-hover:text-brand-lime sm:text-xl">
                {title}
              </h3>
            ) : null}
            {origin ? (
              <p className="mb-4 text-sm text-text-muted">
                <span className="font-semibold text-brand-ink/70">
                  {t(UI.origin, locale)}:
                </span>{" "}
                {origin}
              </p>
            ) : (
              <div className="mb-4" />
            )}
            <span className="mt-auto inline-flex items-center gap-2 text-sm font-bold text-brand-ink transition-all group-hover:gap-3 group-hover:text-brand-lime">
              {t(UI.viewDetails, locale)}
              <span aria-hidden="true">→</span>
            </span>
          </div>
        </Link>
      </article>
    </TiltCard>
  );
}
