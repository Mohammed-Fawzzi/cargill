import React from "react";
import ContentCard from "@/components/ui/ContentCard";
import { useLocale } from "@/context/LocaleContext";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";

export default function ProductCard({
  to,
  imageUrl,
  title,
  subcategory,
  origin,
  layout = "default",
}) {
  const { locale } = useLocale();
  const originLabel = origin
    ? `${t(UI.originShort, locale)}: ${origin}`
    : "";

  return (
    <ContentCard
      to={to}
      imageUrl={imageUrl}
      title={title}
      category={subcategory}
      secondary={originLabel}
      layout={layout}
      imageFit="contain"
    />
  );
}
