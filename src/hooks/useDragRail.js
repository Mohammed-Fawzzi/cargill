import { useCallback, useEffect, useRef, useState } from "react";
import useMotionPrefs from "@/hooks/useMotionPrefs";

const LERP = 0.2;
const FRICTION = 0.95;
const MIN_VELOCITY = 0.08;

function isCardTarget(target) {
  return Boolean(
    target instanceof Element &&
      target.closest(".ix-card, .curtain-card, .drag-rail__track > *"),
  );
}

function isActionTarget(target) {
  if (!(target instanceof Element)) return false;
  return Boolean(
    target.closest(
      ".split-btn, .ix-icon-btn, button, input, textarea, select, [role='button'], a[href], a[to]",
    ),
  );
}

export default function useDragRail() {
  const { reducedMotion, finePointer } = useMotionPrefs();
  const railRef = useRef(null);
  const cursorRef = useRef(null);
  const drag = useRef({
    active: false,
    startX: 0,
    startScroll: 0,
    lastX: 0,
    lastT: 0,
    velocity: 0,
    moved: false,
  });
  const cursor = useRef({ x: 0, y: 0, tx: 0, ty: 0, visible: false });
  const rafRef = useRef(0);
  const [cursorOn, setCursorOn] = useState(false);
  const enabled = !reducedMotion;

  const setCursorVisible = (visible) => {
    cursor.current.visible = visible;
    setCursorOn(visible);
  };

  const tick = useCallback(() => {
    const node = railRef.current;
    const cursorNode = cursorRef.current;
    const state = drag.current;

    if (node && !state.active && Math.abs(state.velocity) > MIN_VELOCITY) {
      node.scrollLeft -= state.velocity;
      state.velocity *= FRICTION;
      if (Math.abs(state.velocity) <= MIN_VELOCITY) state.velocity = 0;
    }

    if (cursorNode && cursor.current.visible) {
      cursor.current.tx += (cursor.current.x - cursor.current.tx) * LERP;
      cursor.current.ty += (cursor.current.y - cursor.current.ty) * LERP;
      cursorNode.style.transform = `translate3d(${cursor.current.tx}px, ${cursor.current.ty}px, 0) translate(-50%, -50%)`;
    }

    rafRef.current = window.requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    if (!enabled) return undefined;
    rafRef.current = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafRef.current);
  }, [enabled, tick]);

  useEffect(() => {
    const node = railRef.current;
    if (!node || !enabled) return undefined;

    const onPointerDown = (event) => {
      if (event.button !== 0) return;
      if (isActionTarget(event.target)) {
        drag.current.active = false;
        drag.current.moved = false;
        return;
      }
      drag.current.active = true;
      drag.current.moved = false;
      drag.current.startX = event.clientX;
      drag.current.startScroll = node.scrollLeft;
      drag.current.lastX = event.clientX;
      drag.current.lastT = performance.now();
      drag.current.velocity = 0;
      node.setPointerCapture?.(event.pointerId);
    };

    const onPointerMove = (event) => {
      cursor.current.x = event.clientX;
      cursor.current.y = event.clientY;

      const overCard = isCardTarget(event.target);
      const overAction = isActionTarget(event.target);
      setCursorVisible(finePointer && overCard && !overAction);

      if (!drag.current.active) return;
      const dx = event.clientX - drag.current.startX;
      if (Math.abs(dx) > 6) drag.current.moved = true;
      if (!drag.current.moved) return;
      node.scrollLeft = drag.current.startScroll - dx;

      const now = performance.now();
      const dt = Math.max(1, now - drag.current.lastT);
      drag.current.velocity = ((event.clientX - drag.current.lastX) / dt) * 16;
      drag.current.lastX = event.clientX;
      drag.current.lastT = now;
    };

    const onPointerUp = (event) => {
      if (!drag.current.active) return;
      drag.current.active = false;
      try {
        node.releasePointerCapture?.(event.pointerId);
      } catch {}
      window.setTimeout(() => {
        drag.current.moved = false;
      }, 0);
    };

    const onClickCapture = (event) => {
      if (!drag.current.moved) return;
      if (isActionTarget(event.target)) {
        drag.current.moved = false;
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      drag.current.moved = false;
    };

    const onLeave = () => {
      setCursorVisible(false);
      drag.current.active = false;
    };

    node.addEventListener("pointerdown", onPointerDown);
    node.addEventListener("pointermove", onPointerMove);
    node.addEventListener("pointerup", onPointerUp);
    node.addEventListener("pointercancel", onPointerUp);
    node.addEventListener("click", onClickCapture, true);
    node.addEventListener("pointerleave", onLeave);

    return () => {
      node.removeEventListener("pointerdown", onPointerDown);
      node.removeEventListener("pointermove", onPointerMove);
      node.removeEventListener("pointerup", onPointerUp);
      node.removeEventListener("pointercancel", onPointerUp);
      node.removeEventListener("click", onClickCapture, true);
      node.removeEventListener("pointerleave", onLeave);
    };
  }, [enabled, finePointer]);

  return { railRef, cursorRef, cursorOn, enabled };
}
