import React from "react";
import { Link } from "react-router-dom";
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
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-black/8 bg-white shadow-[0_8px_28px_rgba(12,18,14,0.05)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_40px_rgba(12,18,14,0.1)]">
      <Link to={to} className="flex h-full flex-col">
        <div className="relative aspect-[4/3] overflow-hidden bg-surface-muted">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-brand-forest text-brand-lime">
              {title}
            </div>
          )}
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
          <span className="mt-auto inline-flex text-sm font-bold text-brand-ink transition-colors group-hover:text-brand-lime">
            {t(UI.viewDetails, locale)}
          </span>
        </div>
      </Link>
    </article>
  );
}
