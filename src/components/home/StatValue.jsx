import React, { useEffect, useRef, useState } from "react";
import useCountUp from "@/hooks/useCountUp";

export default function StatValue({ value, className = "" }) {
  const ref = useRef(null);
  const [active, setActive] = useState(false);
  const counted = useCountUp(value, active);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const display = value >= 1000 ? `+${counted}` : String(counted);

  return (
    <p ref={ref} className={className}>
      {display}
    </p>
  );
}
