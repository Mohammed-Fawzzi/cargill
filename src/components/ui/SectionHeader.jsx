import React from "react";

export default function SectionHeader({
  title,
  body,
  action,
  light = false,
  align = "center",
}) {
  if (!title && !body && !action) return null;

  const alignClass =
    align === "start" ? "items-start text-start" : "items-center text-center";

  return (
    <div className={`mb-10 flex flex-col gap-3 ${alignClass}`}>
      {title ? (
        <h2
          className={`text-2xl font-extrabold sm:text-3xl ${
            light ? "text-white" : "text-brand-ink"
          }`}
        >
          {title}
        </h2>
      ) : null}
      {body ? (
        <p
          className={`max-w-2xl text-sm leading-7 sm:text-base ${
            light ? "text-white/75" : "text-text-muted"
          }`}
        >
          {body}
        </p>
      ) : null}
      {action}
    </div>
  );
}
