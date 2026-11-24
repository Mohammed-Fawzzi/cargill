import React from "react";
import { Link } from "react-router-dom";
import TiltCard from "@/components/ui/TiltCard";
import SafeImage from "@/components/ui/SafeImage";
import { useLocale } from "@/context/LocaleContext";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";

export default function EventCard({
  to,
  imageUrl,
  title,
  body,
  date,
  status,
}) {
  const { locale } = useLocale();
  const isEnded = status === "ended";

  return (
    <TiltCard className="h-full" maxTilt={7}>
      <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-black/8 bg-white shadow-[0_8px_28px_rgba(24,16,96,0.05)] transition-shadow duration-300 hover:shadow-[0_22px_48px_rgba(24,16,96,0.12)]">
        <Link to={to} className="flex h-full flex-col">
          <div className="relative aspect-[16/10] overflow-hidden bg-surface-muted">
            {imageUrl ? (
              <SafeImage
                src={imageUrl}
                alt={title}
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-brand-forest px-4 text-center text-brand-lime">
                {title}
              </div>
            )}
            <span
              className={`absolute start-3 top-3 rounded-full px-3 py-1 text-xs font-bold ${
                isEnded
                  ? "bg-brand-black/75 text-white"
                  : "bg-brand-lime text-brand-ink"
              }`}
            >
              {isEnded ? t(UI.ended, locale) : t(UI.upcoming, locale)}
            </span>
          </div>
          <div className="flex flex-1 flex-col p-5 sm:p-6">
            {date ? (
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-brand-moss">
                {date}
              </p>
            ) : null}
            {title ? (
              <h3 className="mb-3 text-lg font-extrabold leading-7 text-brand-ink transition-colors group-hover:text-brand-lime sm:text-xl">
                {title}
              </h3>
            ) : null}
            {body ? (
              <p className="mb-5 line-clamp-3 text-sm leading-7 text-text-muted">
                {body}
              </p>
            ) : null}
            <span className="mt-auto inline-flex items-center gap-2 text-sm font-bold text-brand-ink transition-all group-hover:gap-3 group-hover:text-brand-lime">
              {t(UI.viewEvent, locale)}
              <span aria-hidden="true">→</span>
            </span>
          </div>
        </Link>
      </article>
    </TiltCard>
  );
}
