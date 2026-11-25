import React, { useEffect, useMemo, useState } from "react";
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
  const [forceVisible, setForceVisible] = useState(Boolean(reducedMotion));
  const words = useMemo(() => {
    if (children) return null;
    return String(text || "")
      .trim()
      .split(/(\s+)/)
      .filter((part) => part.length > 0);
  }, [text, children]);

  useEffect(() => {
    if (reducedMotion) {
      setForceVisible(true);
      return undefined;
    }
    setForceVisible(false);
    const timer = window.setTimeout(() => setForceVisible(true), 1200);
    return () => window.clearTimeout(timer);
  }, [text, children, reducedMotion]);

  if (children) {
    return (
      <Tag className={className}>
        <motion.span
          className={`block overflow-hidden py-[0.12em] ${
            forceVisible ? "reveal-heading__done" : ""
          }`}
          initial={reducedMotion ? false : { opacity: 0.3 }}
          animate={{ opacity: 1 }}
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
          <span
            key={`w-${index}-${part}`}
            className="inline-block overflow-hidden align-bottom px-[0.04em] py-[0.12em]"
          >
            <motion.span
              className={`inline-block ${
                forceVisible ? "reveal-heading__done" : ""
              }`}
              initial={{ y: "110%", opacity: 0 }}
              animate={{ y: "0%", opacity: 1 }}
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
