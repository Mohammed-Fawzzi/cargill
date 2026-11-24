import React from "react";
import { motion } from "framer-motion";
import { easeOut } from "@/lib/motion";

export default function Reveal({
  children,
  className = "",
  delay = 0,
  y = 16,
  x = 0,
  scale = 1,
  as = "div",
}) {
  const Component = motion[as] || motion.div;

  return (
    <Component
      className={className}
      initial={{ opacity: 0, y, x, scale: scale === 1 ? 1 : scale }}
      whileInView={{ opacity: 1, y: 0, x: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.12, margin: "0px 0px -40px 0px" }}
      transition={{ duration: 0.32, ease: easeOut, delay }}
    >
      {children}
    </Component>
  );
}
