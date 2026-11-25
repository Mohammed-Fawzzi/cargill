import React from "react";
import ContentCard from "@/components/ui/ContentCard";

export default function ProductCard({
  to,
  imageUrl,
  title,
  category,
  subcategory,
  origin,
  layout = "default",
}) {
  const label = [category, subcategory].filter(Boolean).join(" / ");

  return (
    <ContentCard
      to={to}
      imageUrl={imageUrl}
      title={title}
      category={label}
      secondary={origin}
      layout={layout}
    />
  );
}
