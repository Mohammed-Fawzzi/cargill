import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import useMotionPrefs from "@/hooks/useMotionPrefs";

export default function SlidingTabs({
  items = [],
  value,
  onChange,
  className = "",
  trackClassName = "",
  buttonClassName = "",
  indicatorClassName = "bg-brand-lime",
  activeTextClassName = "font-semibold text-[#0A0820]",
  idleTextClassName = "font-medium text-white/55 hover:text-white",
  rounded = false,
  renderLabel,
}) {
  const { reducedMotion } = useMotionPrefs();
  const trackRef = useRef(null);
  const btnRefs = useRef(new Map());
  const [indicator, setIndicator] = useState({ left: 0, top: 0, width: 0, height: 0, ready: false });

  const measure = () => {
    const track = trackRef.current;
    const activeBtn = btnRefs.current.get(value);
    if (!track || !activeBtn) return;
    const trackRect = track.getBoundingClientRect();
    const btnRect = activeBtn.getBoundingClientRect();
    setIndicator({
      left: btnRect.left - trackRect.left + track.scrollLeft,
      top: btnRect.top - trackRect.top + track.scrollTop,
      width: btnRect.width,
      height: btnRect.height,
      ready: true,
    });
  };

  useLayoutEffect(() => {
    measure();
  }, [value, items]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;
    const onResize = () => measure();
    window.addEventListener("resize", onResize);
    track.addEventListener("scroll", onResize, { passive: true });
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(onResize) : null;
    ro?.observe(track);
    return () => {
      window.removeEventListener("resize", onResize);
      track.removeEventListener("scroll", onResize);
      ro?.disconnect();
    };
  }, [value, items]);

  return (
    <div className={className}>
      <div
        ref={trackRef}
        className={`relative inline-flex max-w-full items-center gap-1 overflow-x-auto p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
          rounded ? "rounded-full" : ""
        } ${trackClassName}`.trim()}
        role="tablist"
      >
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute z-0 ${
            rounded ? "rounded-full" : ""
          } ${indicatorClassName}`.trim()}
          style={{
            left: indicator.left,
            top: indicator.top,
            width: indicator.width,
            height: indicator.height,
            opacity: indicator.ready ? 1 : 0,
            transition: reducedMotion
              ? "none"
              : "left 300ms cubic-bezier(0.22,1,0.36,1), top 300ms cubic-bezier(0.22,1,0.36,1), width 300ms cubic-bezier(0.22,1,0.36,1), height 300ms cubic-bezier(0.22,1,0.36,1), opacity 200ms ease-out",
          }}
        />
        {items.map((item) => {
          const active = value === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active}
              ref={(node) => {
                if (node) btnRefs.current.set(item.id, node);
                else btnRefs.current.delete(item.id);
              }}
              onClick={() => onChange?.(item.id)}
              className={`relative z-10 whitespace-nowrap px-4 py-2 text-sm transition-colors duration-300 ${
                rounded ? "rounded-full" : ""
              } ${active ? activeTextClassName : idleTextClassName} ${buttonClassName}`.trim()}
            >
              {renderLabel ? renderLabel(item, active) : item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
