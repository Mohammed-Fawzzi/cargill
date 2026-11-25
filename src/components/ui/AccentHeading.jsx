import React, { useMemo } from "react";

function splitAccent(text, accentWord) {
  const raw = String(text || "").trim();
  if (!raw) return [];
  if (accentWord) {
    const needle = String(accentWord).trim();
    const index = raw.lastIndexOf(needle);
    if (index !== -1) {
      return [
        { text: raw.slice(0, index), accent: false },
        { text: needle, accent: true },
        { text: raw.slice(index + needle.length), accent: false },
      ].filter((part) => part.text);
    }
  }

  const parts = raw.split(/(\s+)/);
  let lastIndex = -1;
  for (let i = parts.length - 1; i >= 0; i -= 1) {
    if (parts[i].trim()) {
      lastIndex = i;
      break;
    }
  }
  return parts.map((part, index) => ({
    text: part,
    accent: index === lastIndex,
  }));
}

export default function AccentHeading({
  as: Tag = "h2",
  text,
  accentWord,
  className = "",
  accentClassName = "font-ruqaa text-brand-lime",
}) {
  const parts = useMemo(
    () => splitAccent(text, accentWord),
    [text, accentWord],
  );

  if (!text) return null;

  return (
    <Tag className={className}>
      {parts.map((part, index) =>
        part.accent ? (
          <span key={index} className={`inline-block px-[0.04em] pt-[0.08em] leading-[1.35] ${accentClassName}`}>
            {part.text}
          </span>
        ) : (
          <span key={index}>{part.text}</span>
        ),
      )}
    </Tag>
  );
}
