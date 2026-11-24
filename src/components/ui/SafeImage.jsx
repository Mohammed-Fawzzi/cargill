import React, { useEffect, useState } from "react";
import { FALLBACK_IMAGE, normalizeImageUrl } from "@/lib/image";

export default function SafeImage({
  src,
  alt = "",
  className = "",
  fallback = FALLBACK_IMAGE,
  loading = "lazy",
  width,
  ...props
}) {
  const normalized = normalizeImageUrl(src, {
    width: typeof width === "number" ? width : 1600,
  });
  const [current, setCurrent] = useState(normalized || fallback);

  useEffect(() => {
    setCurrent(normalized || fallback);
  }, [normalized, fallback]);

  return (
    <img
      src={current || fallback}
      alt={alt}
      className={className}
      loading={loading}
      decoding="async"
      onError={() => {
        if (current !== fallback) setCurrent(fallback);
      }}
      {...props}
    />
  );
}
