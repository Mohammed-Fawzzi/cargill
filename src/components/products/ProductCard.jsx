import React from "react";
import { Link } from "react-router-dom";
import SafeImage from "@/components/ui/SafeImage";
import { useLocale } from "@/context/LocaleContext";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";

export default function ProductCard({
  to,
  imageUrl,
  title,
  subcategory,
  origin,
  layout: _layout,
}) {
  const { locale } = useLocale();
  const originLabel = origin
    ? `${t(UI.originShort, locale)}: ${origin}`
    : "";

  return (
    <Link to={to} className="group block text-white">
      <div className="relative h-[300px] overflow-hidden rounded-[20px] border border-white/8 bg-[#110E33]">
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_15%,rgba(140,198,63,0.2),transparent_55%)]"
          aria-hidden="true"
        />
        {imageUrl ? (
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <SafeImage
              src={imageUrl}
              alt={title || ""}
              width={640}
              className="max-h-full max-w-full object-contain transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm font-semibold text-white/40">
            {title}
          </div>
        )}
      </div>

      {subcategory || originLabel ? (
        <div className="mt-[18px] flex justify-between gap-3 text-[13px]">
          {subcategory ? (
            <span className="text-brand-lime">{subcategory}</span>
          ) : (
            <span />
          )}
          {originLabel ? (
            <span className="text-white/60">{originLabel}</span>
          ) : null}
        </div>
      ) : null}

      {title ? (
        <div className="mt-2 font-display text-[26px] font-extrabold leading-tight text-white transition-colors group-hover:text-brand-lime">
          {title}
        </div>
      ) : null}

      <div className="relative mt-[18px] h-px bg-white/14" aria-hidden="true">
        <span className="absolute inset-0 origin-right scale-x-0 bg-brand-lime transition-transform duration-300 group-hover:scale-x-100 motion-reduce:transition-none" />
      </div>
    </Link>
  );
}
