import React from "react";

export default function MonoLabel({
  children,
  index,
  className = "",
  as: Tag = "p",
}) {
  const prefix =
    index !== undefined && index !== null
      ? `§ ${String(index).padStart(2, "0")} — `
      : "";

  return (
    <Tag
      className={`font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-ink/45 sm:text-[11px] ${className}`}
    >
      {prefix}
      {children}
    </Tag>
  );
}
