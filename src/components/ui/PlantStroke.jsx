import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import useMotionPrefs from "@/hooks/useMotionPrefs";

const PATHS = [
  {
    d: "M36 148 C36 118 36 96 36 72 C36 52 38 38 42 28",
    color: "#181060",
  },
  {
    d: "M36 120 C22 112 14 100 18 88 C26 92 34 100 36 110",
    color: "#181060",
  },
  {
    d: "M36 102 C50 94 60 84 58 70 C48 76 40 88 36 96",
    color: "#181060",
  },
  {
    d: "M36 84 C24 74 16 62 20 50 C28 56 34 66 36 76",
    color: "#181060",
  },
  {
    d: "M36 68 C48 58 58 48 56 36 C46 42 40 54 36 62",
    color: "#181060",
  },
  {
    d: "M42 40 C52 28 58 18 54 8 C46 14 42 26 42 36",
    color: "#88c43c",
  },
];

export default function PlantStroke({ className = "" }) {
  const { reducedMotion } = useMotionPrefs();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.9", "end 0.4"],
  });
  const pathLength = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <svg
      ref={ref}
      viewBox="0 0 72 156"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {PATHS.map((item) =>
        reducedMotion ? (
          <path
            key={item.d}
            d={item.d}
            stroke={item.color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <motion.path
            key={item.d}
            d={item.d}
            stroke={item.color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            style={{ pathLength }}
          />
        ),
      )}
    </svg>
  );
}
