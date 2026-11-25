import React from "react";
import ContentCard from "@/components/ui/ContentCard";
import { useLocale } from "@/context/LocaleContext";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";

export default function ArticleCard({
  to,
  imageUrl,
  title,
  body,
  meta,
  layout = "default",
}) {
  const { locale } = useLocale();

  return (
    <ContentCard
      to={to}
      imageUrl={imageUrl}
      title={title}
      body={body}
      category={t(UI.nav.articles, locale)}
      secondary={meta}
      layout={layout}
    />
  );
}
