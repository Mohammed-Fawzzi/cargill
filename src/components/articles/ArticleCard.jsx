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
}) {
  const { locale } = useLocale();
  const categoryLabel = category || t(UI.nav.articles, locale);

  return (
    <Link
      to={to}
      className="group flex h-full flex-col overflow-hidden rounded-xl bg-[#1F1D35] text-white transition-colors duration-300 hover:bg-[#292740]"
    >
      <div
        className={`relative overflow-hidden bg-[#1B1931] ${
          featured ? "h-72 md:h-80" : "h-72"
        }`}
      >
        {imageUrl ? (
          <SafeImage
            src={imageUrl}
            alt={title || ""}
            width={featured ? 1200 : 800}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-6 text-center text-sm text-white/40">
            {title}
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1F1D35] via-transparent to-transparent" />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-6">
        {(categoryLabel || meta) && (
          <p className="text-[11px] font-medium tracking-wide text-white/45">
            {[categoryLabel, meta].filter(Boolean).join(" · ")}
          </p>
        )}

        {title ? (
          <h3
            className={`font-display font-bold leading-tight text-white transition-colors group-hover:text-brand-lime ${
              featured
                ? "text-[clamp(1.35rem,3vw,1.875rem)]"
                : "text-[22px] md:text-[30px] md:leading-[38px]"
            }`}
          >
            {title}
          </h3>
        ) : null}

        {body ? (
          <p className="line-clamp-3 text-[15px] leading-relaxed text-white/55">
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
