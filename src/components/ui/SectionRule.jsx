import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import useCountUp from "@/hooks/useCountUp";
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
  const [active, setActive] = useState(false);

  const target = useMemo(() => {
    const digits = String(number ?? "").replace(/\D/g, "");
    return Number(digits) || 0;
  }, [number]);

  const pad = String(number ?? "").replace(/\D/g, "").length || 2;
  const counted = useCountUp(target, active, 600);
  const display = reducedMotion || !active
    ? String(number).padStart(pad, "0")
    : String(counted).padStart(pad, "0");

  useEffect(() => {
    if (inView) setActive(true);
  }, [inView]);

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
      <p className={`shrink-0 text-[11px] font-bold tracking-[0.2em] ${numberClassName}`}>
        {display}
      </p>
    </div>
  );
}
