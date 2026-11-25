import React from "react";
import { Link } from "react-router-dom";
import SafeImage from "@/components/ui/SafeImage";
import { useLocale } from "@/context/LocaleContext";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";

export default function ArticleCard({
  to,
  imageUrl,
  title,
  body,
  meta,
  category,
  featured = false,
  index = 0,
}) {
  const { locale } = useLocale();
  const categoryLabel = category || t(UI.nav.articles, locale);
  const mediaH = featured ? "20rem" : "18rem";
  const mediaHover = featured ? "24rem" : "21.6rem";
  const number = `${String(index + 1).padStart(2, "0")}.`;

  return (
    <Link
      to={to}
      className="ix-card group flex flex-col overflow-hidden rounded-xl bg-[#1F1D35] text-white transition-colors duration-300 hover:bg-[#292740]"
      style={{ "--ix-media-h": mediaH, "--ix-media-h-hover": mediaHover }}
    >
      <div className="ix-card__media relative overflow-hidden bg-[#1B1931]">
        <div className="ix-card__zoom">
          {imageUrl ? (
            <SafeImage
              src={imageUrl}
              alt={title || ""}
              width={featured ? 1200 : 800}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="px-6 text-center text-sm text-white/40">{title}</span>
          )}
        </div>
        <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-[#1F1D35] via-transparent to-transparent" />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-6">
        {(categoryLabel || meta) && (
          <p className="text-[11px] font-medium tracking-wide text-white/45">
            {[categoryLabel, meta].filter(Boolean).join(" · ")}
          </p>
        )}

        {title ? (
          <div className="ix-card__title-row mt-0">
            <span className="ix-card__num" dir="ltr">
              {number}
            </span>
            <h3
              className={`ix-card__title font-display font-bold leading-tight text-white transition-colors group-hover:text-brand-lime ${
                featured
                  ? "text-[clamp(1.35rem,3vw,1.875rem)]"
                  : "text-[22px] md:text-[30px] md:leading-[38px]"
              }`}
            >
              {title}
            </h3>
          </div>
        ) : null}

        {body ? (
          <p className="ix-card__desc line-clamp-3 text-[15px] leading-relaxed text-white/55">
            {body}
          </p>
        ) : null}

        <span className="mt-auto inline-flex items-center gap-1 pt-3 text-sm font-semibold text-brand-lime">
          <span>{t(UI.readArticle, locale)}</span>
          <span
            className="transition-transform duration-300 group-hover:-translate-x-1"
            aria-hidden="true"
          >
            ←
          </span>
        </span>
      </div>
    </Link>
  );
}
