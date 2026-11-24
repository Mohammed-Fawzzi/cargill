import React from "react";
import { motion } from "framer-motion";

const SHAPES = [
  { top: "10%", left: "6%", size: 38, delay: 0, duration: 8, kind: "leaf" },
  { top: "24%", right: "8%", size: 54, delay: 0.7, duration: 10, kind: "orb" },
  { top: "58%", left: "12%", size: 30, delay: 1.3, duration: 7.5, kind: "leaf" },
  { top: "68%", right: "16%", size: 44, delay: 0.35, duration: 9.5, kind: "leaf" },
  { top: "40%", left: "48%", size: 18, delay: 1, duration: 6.2, kind: "orb" },
  { top: "78%", left: "38%", size: 26, delay: 1.6, duration: 8.8, kind: "orb" },
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
      className="block rounded-full bg-brand-lime/35 blur-[1px]"
      style={{ width: size, height: size }}
      aria-hidden="true"
    />
  );
}

export default function OrganicFloat({ className = "" }) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      {SHAPES.map((shape, index) => (
        <motion.div
          key={index}
          className="absolute text-brand-lime"
          style={{
            top: shape.top,
            left: shape.left,
            right: shape.right,
            width: shape.size,
            height: shape.size,
          }}
          animate={{
            y: [0, -18, 10, 0],
            x: [0, 12, -8, 0],
            rotate: [0, 14, -10, 0],
            scale: [1, 1.08, 0.96, 1],
          }}
          transition={{
            duration: shape.duration,
            delay: shape.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {shape.kind === "orb" ? <Orb size={shape.size} /> : <Leaf size={shape.size} />}
        </motion.div>
      ))}
    </div>
  );
}
