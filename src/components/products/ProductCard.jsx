import React, { useRef } from "react";
import CurtainCard from "@/components/ui/CurtainCard";
import { SplitBtnLabel } from "@/components/ui/SplitArrowButton";
import { useLocale } from "@/context/LocaleContext";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";

export default function ProductCard({
  to,
  imageUrl,
  videoUrl = "",
  title,
  subcategory,
  category,
  origin,
  overview,
}) {
  const { locale } = useLocale();
  const labelRef = useRef(null);
  const label = [subcategory || category, origin].filter(Boolean).join(" · ");

  return (
    <CurtainCard
      to={to}
      imageUrl={imageUrl}
      videoUrl={videoUrl}
      imageAlt={title}
      label={label}
      title={title}
      description={overview}
      fit="contain"
      titleAs="h2"
      className="rounded-xl"
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse" || event.pointerType === "pen") {
          labelRef.current?.play();
        }
      }}
    >
      <span className="split-btn split-btn--primary pointer-events-none mt-4 w-full min-h-10">
        <SplitBtnLabel ref={labelRef} className="flex-1">
          {t(UI.productDetails, locale)}
        </SplitBtnLabel>
        <span className="split-btn__arrow" aria-hidden="true">
          <span className="split-btn__icon">←</span>
        </span>
      </span>
    </CurtainCard>
  );
}
