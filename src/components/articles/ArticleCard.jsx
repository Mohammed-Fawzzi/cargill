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
  layout: _layout,
}) {
  const { locale } = useLocale();
  const categoryLabel = category || t(UI.nav.articles, locale);

  return (
    <Link to={to} className="group block text-white">
      <div
        className={`relative overflow-hidden border border-white/8 bg-[#110E33] ${
          featured ? "h-[280px] rounded-[20px] sm:h-[480px]" : "h-[240px] rounded-[14px] sm:h-[360px]"
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
      </div>

      {(categoryLabel || meta) && (
        <div className="mt-[18px] text-[13px]">
          {categoryLabel ? (
            <span className="text-brand-lime">{categoryLabel}</span>
          ) : null}
          {categoryLabel && meta ? (
            <span className="text-white/55"> · {meta}</span>
          ) : meta ? (
            <span className="text-white/55">{meta}</span>
          ) : null}
        </div>
      )}

      {title ? (
        <div
          className={`mt-2 font-display font-extrabold leading-tight text-white transition-colors group-hover:text-brand-lime ${
            featured ? "text-[clamp(1.75rem,4vw,3.25rem)]" : "text-[28px]"
          }`}
        >
          {title}
        </div>
      ) : null}

      {body ? (
        <p
          className={`mt-2.5 line-clamp-3 leading-[1.7] text-white/65 ${
            featured ? "text-[19px] text-white/72" : "text-[16px]"
          }`}
        >
          {body}
        </p>
      ) : null}
    </Link>
  );
}
