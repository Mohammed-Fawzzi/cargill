import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import SafeImage from "@/components/ui/SafeImage";
import useMotionPrefs from "@/hooks/useMotionPrefs";

export default function ParallaxImage({
  src,
  alt = "",
  width,
  className = "",
  range = 12,
}) {
  const rootRef = useRef(null);
  const { reducedMotion } = useMotionPrefs();
  const { scrollYProgress } = useScroll({
    target: rootRef,
    offset: ["start end", "end start"],
  });
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    reducedMotion ? ["0%", "0%"] : [`-${range}%`, `${range}%`],
  );

  if (!src) return null;

  return (
    <div ref={rootRef} className="parallax-media">
      <motion.div className="parallax-media__shift" style={{ y }}>
        <SafeImage
          src={src}
          alt={alt}
          width={width}
          className={className}
        />
      </motion.div>
    </div>
  );
}
