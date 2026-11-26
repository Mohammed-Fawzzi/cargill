import React from "react";
import ContentCard from "@/components/ui/ContentCard";
import { useLocale } from "@/context/LocaleContext";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";

export default function EventCard({
  to,
  imageUrl,
  videoUrl = "",
  title,
  body,
  date,
  status,
  layout = "default",
}) {
  const { locale } = useLocale();
  const isEnded = status === "ended";

  return (
    <ContentCard
      to={to}
      imageUrl={imageUrl}
      videoUrl={videoUrl}
      title={title}
      body={body}
      category={isEnded ? t(UI.ended, locale) : t(UI.upcoming, locale)}
      secondary={date}
      layout={layout}
    />
  );
}
