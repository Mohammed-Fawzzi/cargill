import React, { useEffect, useState } from "react";
import useDragRail from "@/hooks/useDragRail";
import useMotionPrefs from "@/hooks/useMotionPrefs";

export default function DragRail({
  children,
  className = "",
  trackClassName = "",
  dots = false,
}) {
  const { railRef, cursorRef, cursorOn, enabled } = useDragRail();
  const { reducedMotion } = useMotionPrefs();
  const [active, setActive] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const node = railRef.current;
    if (!node || !dots) return undefined;

    const sync = () => {
      const cards = Array.from(node.children);
      setCount(cards.length);
      if (!cards.length) {
        setActive(0);
        return;
      }
      const mid = node.scrollLeft + node.clientWidth / 2;
      let best = 0;
      let bestDist = Infinity;
      cards.forEach((card, index) => {
        const center = card.offsetLeft + card.offsetWidth / 2;
        const dist = Math.abs(center - mid);
        if (dist < bestDist) {
          bestDist = dist;
          best = index;
        }
      });
      setActive(best);
    };

    sync();
    node.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    const ro =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(sync) : null;
    ro?.observe(node);
    return () => {
      node.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
      ro?.disconnect();
    };
  }, [railRef, dots, children]);

  const scrollToIndex = (index) => {
    const node = railRef.current;
    if (!node) return;
    const card = node.children[index];
    if (!card) return;
    const left =
      card.offsetLeft - (node.clientWidth - card.offsetWidth) / 2;
    node.scrollTo({
      left: Math.max(0, left),
      behavior: reducedMotion ? "auto" : "smooth",
    });
  };

  return (
    <div className={`drag-rail relative ${className}`.trim()}>
      <div
        ref={railRef}
        className={`drag-rail__track flex items-start gap-4 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
          enabled ? "drag-rail__track--active" : ""
        } ${trackClassName}`.trim()}
      >
        {children}
      </div>
      {enabled ? (
        <div
          ref={cursorRef}
          className={`drag-rail__cursor pointer-events-none fixed top-0 left-0 z-50 grid h-11 w-11 place-items-center rounded-full bg-white text-[#0A0820] shadow-[0_6px_18px_rgba(10,8,32,0.16)] transition-opacity duration-300 ${
            cursorOn ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 64 24"
            className="block h-3 w-7"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M8 12h48M8 12 15 6M8 12l7 6M56 12l-7-6M56 12l-7 6"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      ) : null}
      {dots && count > 1 ? (
        <div
          className="mt-6 flex items-center justify-center gap-2"
          role="tablist"
          aria-label="Carousel"
        >
          {Array.from({ length: count }).map((_, index) => {
            const isActive = index === active;
            return (
              <button
                key={index}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={`${index + 1}`}
                onClick={() => scrollToIndex(index)}
                className="rail-dot group inline-flex h-3 items-center justify-center"
              >
                <span
                  className={`block h-2 rounded-full transition-[width,background-color] duration-300 ease-out ${
                    isActive
                      ? "w-7 bg-brand-lime"
                      : "w-2 bg-white/25 group-hover:bg-white/45"
                  }`}
                  style={{
                    transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
                  }}
                />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
