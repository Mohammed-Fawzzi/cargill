import React, { useMemo, useRef } from "react";
import { motion, useInView } from "framer-motion";
import useMotionPrefs from "@/hooks/useMotionPrefs";
import { easeOut } from "@/lib/motion";

export default function SectionIntro({
  label,
  title,
  action,
  align = "between",
  className = "",
  titleClassName = "font-display text-3xl font-bold text-white md:text-4xl",
  labelClassName = "mb-2 text-xs font-medium tracking-wide text-brand-lime",
  body,
  bodyClassName = "max-w-md text-sm text-white/55 md:text-end",
}) {
  const { reducedMotion } = useMotionPrefs();
  const rootRef = useRef(null);
  const inView = useInView(rootRef, { once: true, amount: 0.35 });
  const active = reducedMotion || inView;

  const words = useMemo(() => {
    const raw = String(title || "").trim();
    if (!raw) return [];
    return raw.split(/(\s+)/).filter((part) => part.length > 0);
  }, [title]);

  const titleStart = reducedMotion ? 0 : 0.12;
  const actionDelay = reducedMotion
    ? 0
    : titleStart + Math.min(words.filter((w) => w.trim()).length, 12) * 0.06 + 0.08;

  const rowClass =
    align === "between"
      ? "mb-12 flex flex-col justify-between gap-4 md:mb-16 md:flex-row md:items-end"
      : "mb-10 flex flex-col gap-3";

  return (
    <div ref={rootRef} className={`${rowClass} ${className}`.trim()}>
      <div>
        {label ? (
          <motion.p
            className={labelClassName}
            initial={reducedMotion ? false : { opacity: 0, y: 6 }}
            animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
            transition={{ duration: 0.4, ease: easeOut, delay: 0 }}
          >
            {label}
          </motion.p>
        ) : null}

        {title ? (
          <h2 className={titleClassName}>
            {reducedMotion
              ? title
              : words.map((part, index) => {
                  if (!part.trim()) {
                    return <span key={`s-${index}`}>{part}</span>;
                  }
                  const wordIndex = words
                    .slice(0, index)
                    .filter((item) => item.trim()).length;
                  return (
                    <span
                      key={`w-${index}-${part}`}
                      className="inline-block overflow-hidden align-bottom py-[0.08em]"
                    >
                      <motion.span
                        className="inline-block"
                        initial={{ y: "110%", opacity: 0 }}
                        animate={
                          active
                            ? { y: "0%", opacity: 1 }
                            : { y: "110%", opacity: 0 }
                        }
                        transition={{
                          duration: 0.45,
                          ease: easeOut,
                          delay: titleStart + wordIndex * 0.06,
                        }}
                      >
                        {part}
                      </motion.span>
                    </span>
                  );
                })}
          </h2>
        ) : null}
      </div>

      {(body || action) && (
        <motion.div
          className="flex flex-col items-start gap-3 md:items-end"
          initial={reducedMotion ? false : { opacity: 0, y: 8 }}
          animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
          transition={{ duration: 0.4, ease: easeOut, delay: actionDelay }}
        >
          {body ? <p className={bodyClassName}>{body}</p> : null}
          {action}
        </motion.div>
      )}
    </div>
  );
}
