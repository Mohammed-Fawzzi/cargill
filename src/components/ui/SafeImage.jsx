import React from "react";
import { normalizeImageUrl } from "@/lib/image";

export default function SafeImage({
  src,
  alt = "",
  className = "",
  loading = "lazy",
  width,
  ...props
}) {
  const normalized = normalizeImageUrl(src, {
    width: typeof width === "number" ? width : 1600,
  });

  if (!normalized) return null;

  return (
    <img
      src={normalized}
      alt={alt}
      className={className}
      loading={loading}
      decoding="async"
      {...props}
    />
  );
}
