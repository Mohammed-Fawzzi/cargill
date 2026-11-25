import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import useMotionPrefs from "@/hooks/useMotionPrefs";
import { easeOut } from "@/lib/motion";

export default function SectionRule({
  label,
  number,
  labelClassName = "",
  numberClassName = "",
  lineClassName = "bg-brand-ink",
  className = "mb-6 flex items-center gap-4",
}) {
  const { reducedMotion } = useMotionPrefs();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const display = String(number ?? "").padStart(2, "0");

  return (
    <div ref={ref} className={className}>
      <p className={`text-clip-safe shrink-0 text-[11px] font-bold tracking-[0.18em] ${labelClassName}`}>
        {label}
      </p>
      <span className="relative h-px flex-1 overflow-hidden" aria-hidden="true">
        <motion.span
          className={`absolute inset-0 origin-left rtl:origin-right ${lineClassName}`}
          initial={reducedMotion ? false : { scaleX: 0 }}
          animate={inView || reducedMotion ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ duration: 0.6, ease: easeOut }}
        />
      </span>
      <motion.p
        className={`shrink-0 text-[11px] font-bold tracking-[0.2em] ${numberClassName}`}
        initial={reducedMotion ? false : { opacity: 0 }}
        animate={inView || reducedMotion ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.45, ease: easeOut }}
      >
        {display}
      </motion.p>
    </div>
  );
}
