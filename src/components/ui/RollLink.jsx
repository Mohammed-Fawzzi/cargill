import React, { useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import useMotionPrefs from "@/hooks/useMotionPrefs";

const OUT_EASE = "cubic-bezier(0.55, 0, 1, 0.45)";
const IN_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

function toText(node) {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(toText).join("");
  if (React.isValidElement(node)) return toText(node.props?.children);
  return "";
}

function splitWords(text) {
  return String(text || "")
    .split(/(\s+)/)
    .filter((part) => part.length > 0);
}

async function playWord(el, delayMs) {
  if (!el) return;
  if (delayMs > 0) {
    await new Promise((resolve) => window.setTimeout(resolve, delayMs));
  }

  const out = el.animate(
    [
      { transform: "translateY(0)", opacity: 1 },
      { transform: "translateY(-0.45em)", opacity: 0 },
    ],
    { duration: 380, easing: OUT_EASE, fill: "forwards" },
  );
  await out.finished;

  const hold = el.animate(
    [
      { transform: "translateY(0.45em)", opacity: 0 },
      { transform: "translateY(0.45em)", opacity: 0 },
    ],
    { duration: 140, fill: "forwards" },
  );
  await hold.finished;

  const inn = el.animate(
    [
      { transform: "translateY(0.45em)", opacity: 0 },
      { transform: "translateY(0)", opacity: 1 },
    ],
    { duration: 420, easing: IN_EASE, fill: "forwards" },
  );
  await inn.finished;
}

export default function RollLink({
  to,
  href,
  children,
  className = "",
  dir,
  target,
  rel,
  onClick,
}) {
  const { reducedMotion } = useMotionPrefs();
  const runningRef = useRef(false);
  const wordRefs = useRef([]);
  const text = useMemo(() => toText(children), [children]);
  const parts = useMemo(() => splitWords(text), [text]);

  const play = () => {
    if (runningRef.current) return;
    if (reducedMotion) return;
    const words = wordRefs.current.filter(Boolean);
    if (!words.length) return;

    runningRef.current = true;
    Promise.all(words.map((el, index) => playWord(el, index * 60))).finally(
      () => {
        runningRef.current = false;
      },
    );
  };

  const shared = {
    className: `ix-footer-link ${className}`.trim(),
    dir,
    onClick,
    onPointerEnter: () => {
      play();
    },
    onFocus: (event) => {
      if (event.currentTarget.matches(":focus-visible")) {
        play();
      }
    },
  };

  let wordIndex = 0;
  const content = (
    <span className="ix-footer-link__track">
      {parts.map((part, index) => {
        if (!part.trim()) {
          return <span key={`s-${index}`}>{part}</span>;
        }
        const slot = wordIndex;
        wordIndex += 1;
        return (
          <span
            key={`w-${index}-${part}`}
            ref={(node) => {
              wordRefs.current[slot] = node;
            }}
            className="ix-footer-link__word"
          >
            {part}
          </span>
        );
      })}
    </span>
  );

  if (to) {
    return (
      <Link to={to} {...shared}>
        {content}
      </Link>
    );
  }

  return (
    <a href={href} target={target} rel={rel} {...shared}>
      {content}
    </a>
  );
}
