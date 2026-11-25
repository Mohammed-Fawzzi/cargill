import React from "react";

export default function AmbientGlow({
  tone = "lime",
  className = "",
  style,
}) {
  const color =
    tone === "navy"
      ? "rgba(24, 16, 96, 0.35)"
      : "rgba(136, 196, 60, 0.07)";

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute rounded-full blur-3xl ${className}`}
      style={{
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        ...style,
      }}
    />
  );
}
