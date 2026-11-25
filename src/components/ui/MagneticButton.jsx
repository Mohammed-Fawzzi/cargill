import React, { useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import useMotionPrefs from "@/hooks/useMotionPrefs";

export default function MagneticButton({
  children,
  className = "",
  as = "div",
  strength = 6,
}) {
  const ref = useRef(null);
  const { canTilt } = useMotionPrefs();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 220, damping: 24, mass: 0.35 });
  const springY = useSpring(y, { stiffness: 220, damping: 24, mass: 0.35 });
  const Component = motion[as] || motion.div;

  const onMove = (event) => {
    if (!canTilt) return;
    const node = ref.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const dx = event.clientX - (rect.left + rect.width / 2);
    const dy = event.clientY - (rect.top + rect.height / 2);
    x.set((dx / rect.width) * strength);
    y.set((dy / rect.height) * strength);
  };

  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <Component
      ref={ref}
      className={className}
      style={canTilt ? { x: springX, y: springY } : undefined}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {children}
    </Component>
  );
}
