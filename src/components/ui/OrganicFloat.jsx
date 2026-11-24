import React, { useEffect, useState } from "react";

const SHAPES = [
  { top: "12%", left: "8%", size: 34, delay: "0s", duration: "7s", kind: "leaf" },
  { top: "28%", right: "10%", size: 46, delay: "0.8s", duration: "9s", kind: "orb" },
  { top: "68%", right: "18%", size: 38, delay: "0.4s", duration: "8s", kind: "leaf" },
];

function Leaf({ size }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M24 4C14 12 8 22 8 30c0 8 7 14 16 14s16-6 16-14C40 22 34 12 24 4Z"
        fill="currentColor"
        opacity="0.55"
      />
      <path
        d="M24 10v30"
        stroke="currentColor"
        strokeWidth="2"
        opacity="0.35"
      />
    </svg>
  );
}

function Orb({ size }) {
  return (
    <span
      className="block rounded-full bg-brand-lime/35"
      style={{ width: size, height: size }}
      aria-hidden="true"
    />
  );
}

export default function OrganicFloat({ className = "" }) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const wide = window.matchMedia("(min-width: 768px)");
    const sync = () => setEnabled(!reduced.matches && wide.matches);
    sync();
    reduced.addEventListener("change", sync);
    wide.addEventListener("change", sync);
    return () => {
      reduced.removeEventListener("change", sync);
      wide.removeEventListener("change", sync);
    };
  }, []);

  if (!enabled) return null;

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      {SHAPES.map((shape, index) => (
        <div
          key={index}
          className="absolute animate-soft-float text-brand-lime"
          style={{
            top: shape.top,
            left: shape.left,
            right: shape.right,
            width: shape.size,
            height: shape.size,
            animationDelay: shape.delay,
            animationDuration: shape.duration,
          }}
        >
          {shape.kind === "orb" ? <Orb size={shape.size} /> : <Leaf size={shape.size} />}
        </div>
      ))}
    </div>
  );
}
