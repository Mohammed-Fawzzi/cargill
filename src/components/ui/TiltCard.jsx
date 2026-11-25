import React, { useRef } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";
import useMotionPrefs from "@/hooks/useMotionPrefs";

export default function TiltCard({
  children,
  className = "",
  maxTilt = 4,
  depth = 6,
}) {
  const ref = useRef(null);
  const { canTilt } = useMotionPrefs();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(y, { stiffness: 160, damping: 22, mass: 0.4 });
  const rotateY = useSpring(x, { stiffness: 160, damping: 22, mass: 0.4 });
  const transform = useMotionTemplate`perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

  const onMove = (event) => {
    if (!canTilt) return;
    const node = ref.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    x.set((px - 0.5) * maxTilt * 2);
    y.set((0.5 - py) * maxTilt * 2);
  };

  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={`will-change-transform ${className}`}
      style={
        canTilt
          ? { transform, transformStyle: "preserve-3d" }
          : undefined
      }
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <div
        className="h-full w-full"
        style={
          canTilt && depth
            ? { transform: `translateZ(${depth}px)`, transformStyle: "preserve-3d" }
            : undefined
        }
      >
        {children}
      </div>
    </motion.div>
  );
}
