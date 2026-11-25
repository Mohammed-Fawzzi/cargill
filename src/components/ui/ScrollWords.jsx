import React, { useMemo } from "react";
import { motion, useTransform } from "framer-motion";

function Word({ word, index, total, progress, accent }) {
  const start = index / total;
  const end = (index + 0.85) / total;
  const opacity = useTransform(progress, [start, end], [0.25, 1]);

  return (
    <motion.span
      style={{ opacity }}
      className={accent ? "inline text-brand-lime" : "inline"}
    >
      {word}
      {index < total - 1 ? " " : ""}
    </motion.span>
  );
}

function pickAccentRange(words) {
  if (words.length < 6) return { start: -1, end: -1 };
  const start = Math.floor(words.length * 0.28);
  const span = Math.max(3, Math.min(5, Math.round(words.length * 0.18)));
  return { start, end: Math.min(words.length - 1, start + span - 1) };
}

export default function ScrollWords({
  text,
  progress,
  reducedMotion,
  mobile,
  className = "text-[20px] font-medium leading-[1.8] text-ink sm:text-[22px]",
  accentPhrase = true,
}) {
  const words = useMemo(
    () =>
      String(text || "")
        .trim()
        .split(/\s+/)
        .filter(Boolean),
    [text],
  );

  const accent = useMemo(
    () => (accentPhrase ? pickAccentRange(words) : { start: -1, end: -1 }),
    [words, accentPhrase],
  );

  if (!text) return null;

  if (reducedMotion || mobile) {
    return (
      <p className={`${className} text-ink/85`}>
        {words.map((word, index) => {
          const isAccent =
            accent.start >= 0 && index >= accent.start && index <= accent.end;
          return (
            <span
              key={`${word}-${index}`}
              className={isAccent ? "text-brand-lime" : undefined}
            >
              {word}
              {index < words.length - 1 ? " " : ""}
            </span>
          );
        })}
      </p>
    );
  }

  return (
    <p className={className}>
      {words.map((word, index) => (
        <Word
          key={`${word}-${index}`}
          word={word}
          index={index}
          total={words.length}
          progress={progress}
          accent={
            accent.start >= 0 && index >= accent.start && index <= accent.end
          }
        />
      ))}
    </p>
  );
}
