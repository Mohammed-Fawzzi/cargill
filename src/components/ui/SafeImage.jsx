import React from "react";
import { buildImageSrcSet, normalizeImageUrl } from "@/lib/image";

export default function SafeImage({
  src,
  alt = "",
  className = "",
  loading = "lazy",
  width,
  sizes,
  ...props
}) {
  const baseWidth = typeof width === "number" ? width : 1600;
  const normalized = normalizeImageUrl(src, {
    width: baseWidth,
  });
  const srcSet = buildImageSrcSet(src, {
    quality: 75,
  });

  if (!normalized) return null;

  return (
    <img
      src={normalized}
      srcSet={srcSet || undefined}
      sizes={srcSet ? sizes || "100vw" : undefined}
      alt={alt}
      className={className}
      loading={loading}
      decoding="async"
      {...props}
    />
  );
}
