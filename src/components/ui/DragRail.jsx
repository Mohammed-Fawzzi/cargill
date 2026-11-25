import React from "react";
import useDragRail from "@/hooks/useDragRail";

export default function DragRail({ children, className = "" }) {
  const { railRef, cursorRef, cursorOn, enabled } = useDragRail();

  return (
    <div className={`drag-rail relative ${className}`.trim()}>
      <div
        ref={railRef}
        className={`drag-rail__track flex gap-4 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
          enabled ? "drag-rail__track--active cursor-none" : ""
        }`}
      >
        {children}
      </div>
      {enabled ? (
        <div
          ref={cursorRef}
          className={`drag-rail__cursor pointer-events-none fixed top-0 left-0 z-50 flex h-[72px] w-[72px] items-center justify-center rounded-full bg-white text-[#0A0820] shadow-[0_8px_24px_rgba(10,8,32,0.18)] transition-opacity duration-300 ${
            cursorOn ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden="true"
        >
          <span className="font-mono text-sm tracking-widest" dir="ltr">
            ↔
          </span>
        </div>
      ) : null}
    </div>
  );
}
