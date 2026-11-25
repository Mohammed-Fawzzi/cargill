import React from "react";

export const TRIANGLE_CLIP = "polygon(50% 0%, 0% 100%, 100% 100%)";

export default function TriangleMask({
  children,
  className = "",
  as: Tag = "div",
}) {
  return (
    <Tag
      className={`overflow-hidden [clip-path:polygon(50%_0%,0%_100%,100%_100%)] ${className}`}
      style={{ clipPath: TRIANGLE_CLIP }}
    >
      {children}
    </Tag>
  );
}

export function TriangleAccent({ className = "", tone = "lime" }) {
  const toneClass = tone === "ink" ? "bg-brand-ink" : "bg-brand-lime";

  return (
    <span
      className={`inline-block shrink-0 [clip-path:polygon(50%_0%,0%_100%,100%_100%)] ${toneClass} ${className}`}
      style={{ clipPath: TRIANGLE_CLIP }}
      aria-hidden="true"
    />
  );
}
