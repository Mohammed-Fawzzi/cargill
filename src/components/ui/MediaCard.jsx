import React from "react";
import { Link } from "react-router-dom";
import SafeMedia from "@/components/ui/SafeMedia";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";
import { useLocale } from "@/context/LocaleContext";

export default function MediaCard({
  to,
  imageUrl,
  videoUrl = "",
  title,
  body,
  meta,
  badge,
  index = 0,
}) {
  const { locale } = useLocale();
  const number = `${String(index + 1).padStart(2, "0")}.`;
  const mediaH = "11.5rem";
  const hasMedia = Boolean(imageUrl || videoUrl);

  return (
    <article className="h-full">
      <Link
        to={to}
        className="ix-card group text-ink"
        style={{ "--ix-media-h": mediaH }}
      >
        <div
          className="ix-card__media bg-surface-muted"
          style={{ height: mediaH }}
        >
          {hasMedia ? (
            <SafeMedia
              src={imageUrl}
              videoUrl={videoUrl}
              alt={title}
              className="h-full w-full object-cover"
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
        <div>
          {meta ? (
            <p className="mt-3 text-xs font-bold text-brand-moss">{meta}</p>
          ) : null}
          {title ? (
            <div className="ix-card__title-row">
              <span className="ix-card__num text-ink/20" dir="ltr">
                {number}
              </span>
              <h3 className="ix-card__title text-lg font-extrabold text-ink">
                {title}
              </h3>
            </div>
          ) : null}
          {body ? (
            <p className="ix-card__desc line-clamp-3 text-sm leading-7 text-text-muted">
              {body}
            </p>
          ) : null}
          <span className="ix-link mt-4 text-sm font-bold text-brand-moss">
            {t(UI.readMore, locale)}
          </span>
        </div>
      </Link>
    </article>
  );
}
