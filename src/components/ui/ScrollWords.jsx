import React, { useMemo } from "react";
import { motion, useTransform } from "framer-motion";

function Word({ word, index, total, progress }) {
  const start = index / total;
  const end = (index + 0.85) / total;
  const opacity = useTransform(progress, [start, end], [0.25, 1]);

  return (
    <motion.span style={{ opacity }} className="inline">
      {word}
      {index < total - 1 ? " " : ""}
    </motion.span>
  );
}

export default function ScrollWords({
  text,
  progress,
  reducedMotion,
  mobile,
  className = "text-[20px] font-medium leading-[1.8] text-brand-ink sm:text-[22px]",
}) {
  const words = useMemo(
    () =>
      String(text || "")
        .trim()
        .split(/\s+/)
        .filter(Boolean),
    [text],
  );

  if (!text) return null;

  if (reducedMotion || mobile) {
    return <p className={`${className} text-brand-ink/85`}>{text}</p>;
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
        />
      ))}
    </p>
  );
}
