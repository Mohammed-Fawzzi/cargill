import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { easeOut } from "@/lib/motion";
import useMotionPrefs from "@/hooks/useMotionPrefs";

export default function RevealHeading({
  as: Tag = "h2",
  text,
  className = "",
  children,
}) {
  const { reducedMotion } = useMotionPrefs();
  const words = useMemo(() => {
    if (children) return null;
    return String(text || "")
      .trim()
      .split(/(\s+)/)
      .filter((part) => part.length > 0);
  }, [text, children]);

  if (children) {
    return (
      <Tag className={className}>
        <motion.span
          className="block overflow-hidden py-[0.12em]"
          initial={reducedMotion ? false : { opacity: 0.3 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.45 }}
          transition={{ duration: 0.55, ease: easeOut }}
        >
          {children}
        </motion.span>
      </Tag>
    );
  }

  if (!text) return null;

  if (reducedMotion) {
    return <Tag className={className}>{text}</Tag>;
  }

  return (
    <Tag className={className}>
      {words.map((part, index) => {
        if (!part.trim()) {
          return <span key={`s-${index}`}>{part}</span>;
        }
        return (
          <span key={`w-${index}`} className="inline-block overflow-hidden align-bottom py-[0.08em]">
            <motion.span
              className="inline-block"
              initial={{ y: "110%", opacity: 0 }}
              whileInView={{ y: "0%", opacity: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{
                duration: 0.45,
                delay: Math.min(index * 0.03, 0.45),
                ease: easeOut,
              }}
            >
              {part}
            </motion.span>
          </span>
        );
      })}
    </Tag>
  );
}
