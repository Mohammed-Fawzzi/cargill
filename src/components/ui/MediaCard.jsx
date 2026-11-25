import React from "react";
import { Link } from "react-router-dom";
import SafeImage from "@/components/ui/SafeImage";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";
import { useLocale } from "@/context/LocaleContext";

export default function MediaCard({
  to,
  imageUrl,
  title,
  body,
  meta,
  badge,
}) {
  const { locale } = useLocale();

  return (
    <article className="group overflow-hidden rounded-2xl border border-black/5 bg-page shadow-[0_10px_30px_rgba(12,18,14,0.06)] transition-transform hover:-translate-y-1">
      <Link to={to} className="block">
        <div className="relative aspect-[16/10] overflow-hidden bg-surface-muted">
          {imageUrl ? (
            <SafeImage
              src={imageUrl}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-brand-forest text-brand-lime">
              {title}
            </div>
          )}
          {badge ? (
            <span className="absolute start-3 top-3 rounded-full bg-brand-black/80 px-3 py-1 text-xs font-bold text-brand-lime">
              {badge}
            </span>
          ) : null}
        </div>
        <div className="p-5">
          {meta ? (
            <p className="mb-2 text-xs font-bold text-brand-moss">{meta}</p>
          ) : null}
          {title ? (
            <h3 className="mb-2 text-lg font-extrabold text-ink">{title}</h3>
          ) : null}
          {body ? (
            <p className="line-clamp-3 text-sm leading-7 text-text-muted">{body}</p>
          ) : null}
          <span className="mt-4 inline-flex text-sm font-bold text-brand-moss transition-colors group-hover:text-brand-lime">
            {t(UI.readMore, locale)}
          </span>
        </div>
      </Link>
    </article>
  );
}
