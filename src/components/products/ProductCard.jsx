import React, { useRef } from "react";
import { Link } from "react-router-dom";
import SafeImage from "@/components/ui/SafeImage";
import { SplitBtnLabel } from "@/components/ui/SplitArrowButton";
import { useLocale } from "@/context/LocaleContext";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";

export default function ProductCard({
  to,
  imageUrl,
  title,
  subcategory,
  category,
  origin,
  overview,
  index = 0,
}) {
  const { locale } = useLocale();
  const labelRef = useRef(null);
  const number = `${String(index + 1).padStart(2, "0")}.`;
  const badge = subcategory || category || "";
  const metaLabel = subcategory || category || "";
  const mediaH = "16rem";
  const mediaHover = "19.2rem";

  return (
    <Link
      to={to}
      className="ix-card group relative flex flex-col justify-between overflow-hidden bg-[#1B1931] text-white transition-colors duration-300 hover:bg-[#1F1D35]"
      style={{ "--ix-media-h": mediaH, "--ix-media-h-hover": mediaHover }}
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse" || event.pointerType === "pen") {
          labelRef.current?.play();
        }
      }}
    >
      <span
        className="absolute inset-x-0 top-0 h-1 bg-transparent transition-colors duration-300 group-hover:bg-brand-lime"
        aria-hidden="true"
      />

      <div>
        <div className="ix-card__media product-stage relative mx-5 mt-5 overflow-hidden bg-[#0D0B23]">
          <div className="ix-card__zoom p-6">
            {imageUrl ? (
              <SafeImage
                src={imageUrl}
                alt={title || ""}
                width={640}
                className="max-h-full max-w-[80%] object-contain"
              />
            ) : (
              <span className="px-4 text-center text-sm font-semibold text-white/40">
                {title}
              </span>
            )}
          </div>

          {badge ? (
            <span className="absolute end-3 top-3 z-20 bg-[#292740] px-2 py-0.5 text-[11px] font-medium tracking-wide text-brand-lime">
              {badge}
            </span>
          ) : null}

          {origin ? (
            <span className="absolute bottom-3 start-3 z-20 flex items-center gap-1 bg-[#0D0B23]/80 px-2 py-0.5 text-[12px] text-white/55 backdrop-blur-sm">
              {origin}
            </span>
          ) : null}
        </div>

        <div className="flex flex-col px-5 pt-4">
          {metaLabel ? (
            <span className="text-[11px] font-medium tracking-wide text-brand-lime">
              {metaLabel}
            </span>
          ) : null}
          {title ? (
            <div className="ix-card__title-row mt-1">
              <span className="ix-card__num" dir="ltr">
                {number}
              </span>
              <h2 className="ix-card__title font-display text-xl font-semibold text-white transition-colors group-hover:text-brand-lime md:text-[22px]">
                {title}
              </h2>
            </div>
          ) : null}
          {overview ? (
            <p className="ix-card__desc line-clamp-2 text-[13px] leading-relaxed text-white/55">
              {overview}
            </p>
          ) : null}
        </div>
      </div>

      <div className="px-5 pb-5 pt-4">
        <span className="split-btn split-btn--primary pointer-events-none w-full min-h-10">
          <SplitBtnLabel ref={labelRef} className="flex-1">
            {t(UI.productDetails, locale)}
          </SplitBtnLabel>
          <span className="split-btn__arrow" aria-hidden="true">
            <span className="split-btn__icon">←</span>
          </span>
        </span>
      </div>
    </Link>
  );
}
