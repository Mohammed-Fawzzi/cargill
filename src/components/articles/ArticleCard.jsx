import React from "react";
import CurtainCard from "@/components/ui/CurtainCard";
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
}) {
  const { locale } = useLocale();
  const categoryLabel = category || t(UI.nav.articles, locale);
  const label = [categoryLabel, meta].filter(Boolean).join(" / ");

  return (
    <CurtainCard
      to={to}
      imageUrl={imageUrl}
      imageAlt={title}
      label={label}
      title={title}
      description={body}
      className="h-full rounded-xl"
    >
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-lime">
        <span>{t(UI.readArticle, locale)}</span>
        <span aria-hidden="true">←</span>
      </span>
    </CurtainCard>
  );
}
