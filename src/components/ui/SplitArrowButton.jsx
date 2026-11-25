import React, {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import { Link } from "react-router-dom";
import { isExternalHref } from "@/components/ui/CtaLink";
import useMotionPrefs from "@/hooks/useMotionPrefs";

const OUT_EASE = "cubic-bezier(0.55, 0, 1, 0.45)";
const IN_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

function toText(node) {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(toText).join("");
  if (React.isValidElement(node)) return toText(node.props?.children);
  return "";
}

function splitWords(text) {
  return String(text || "")
    .split(/(\s+)/)
    .filter((part) => part.length > 0);
}

function partitionChildren(children) {
  const icons = [];
  let text = "";
  let textDir;

  React.Children.forEach(children, (child) => {
    if (child == null || typeof child === "boolean") return;
    if (typeof child === "string" || typeof child === "number") {
      text += String(child);
      return;
    }
    if (!React.isValidElement(child)) return;

    if (child.type === "span") {
      if (child.props?.dir) textDir = child.props.dir;
      text += toText(child);
      return;
    }

    const inner = toText(child);
    if (!inner.trim()) {
      icons.push(child);
      return;
    }
    text += inner;
  });

  return { icons, text, textDir };
}

async function playWord(el, delayMs) {
  if (!el) return;
  if (delayMs > 0) {
    await new Promise((resolve) => window.setTimeout(resolve, delayMs));
  }

  const out = el.animate(
    [
      { transform: "translateY(0)", opacity: 1 },
      { transform: "translateY(-0.5em)", opacity: 0 },
    ],
    { duration: 380, easing: OUT_EASE, fill: "forwards" },
  );
  await out.finished;

  const hold = el.animate(
    [
      { transform: "translateY(0.5em)", opacity: 0 },
      { transform: "translateY(0.5em)", opacity: 0 },
    ],
    { duration: 160, fill: "forwards" },
  );
  await hold.finished;

  const inn = el.animate(
    [
      { transform: "translateY(0.5em)", opacity: 0 },
      { transform: "translateY(0)", opacity: 1 },
    ],
    { duration: 420, easing: IN_EASE, fill: "forwards" },
  );
  await inn.finished;
}

export const SplitBtnLabel = forwardRef(function SplitBtnLabel(
  { children, className = "" },
  ref,
) {
  const { reducedMotion, finePointer } = useMotionPrefs();
  const runningRef = useRef(false);
  const labelRef = useRef(null);
  const wordRefs = useRef([]);
  const { icons, text, textDir } = useMemo(
    () => partitionChildren(children),
    [children],
  );
  const parts = useMemo(() => splitWords(text), [text]);

  const play = () => {
    if (runningRef.current) return;
    if (reducedMotion || !finePointer) return;
    const words = wordRefs.current.filter(Boolean);
    if (!words.length) return;

    runningRef.current = true;
    if (labelRef.current) {
      labelRef.current.style.minWidth = `${labelRef.current.getBoundingClientRect().width}px`;
    }

    Promise.all(words.map((el, index) => playWord(el, index * 60))).finally(
      () => {
        runningRef.current = false;
        if (labelRef.current) {
          labelRef.current.style.minWidth = "";
        }
      },
    );
  };

  useImperativeHandle(ref, () => ({ play }));

  let wordIndex = 0;

  return (
    <span ref={labelRef} className={`split-btn__label ${className}`.trim()}>
      {icons.map((icon, index) =>
        React.isValidElement(icon)
          ? React.cloneElement(icon, { key: icon.key ?? `icon-${index}` })
          : icon,
      )}
      <span className="split-btn__text" dir={textDir || undefined}>
        {parts.map((part, index) => {
          if (!part.trim()) {
            return <span key={`s-${index}`}>{part}</span>;
          }
          const slot = wordIndex;
          wordIndex += 1;
          return (
            <span
              key={`w-${index}-${part}`}
              ref={(node) => {
                wordRefs.current[slot] = node;
              }}
              className="split-btn__word"
            >
              {part}
            </span>
          );
        })}
      </span>
    </span>
  );
});

function resolveElement({ to, href, type, disabled }) {
  if (to) return { Comp: Link, props: { to } };
  if (href) {
    const external = isExternalHref(href) && /^https?:/i.test(href);
    return {
      Comp: "a",
      props: {
        href,
        ...(external ? { target: "_blank", rel: "noopener noreferrer" } : {}),
      },
    };
  }
  return {
    Comp: "button",
    props: { type: type || "button", disabled },
  };
}

export default function SplitArrowButton({
  children,
  to,
  href,
  type,
  disabled,
  variant = "primary",
  className = "",
  onClick,
  arrow = true,
}) {
  const { Comp, props } = resolveElement({ to, href, type, disabled });
  const tone =
    variant === "secondary" ? "split-btn--secondary" : "split-btn--primary";
  const labelRef = useRef(null);

  const onPointerEnter = (event) => {
    if (event.pointerType === "mouse" || event.pointerType === "pen") {
      labelRef.current?.play();
    }
  };

  return (
    <Comp
      {...props}
      onClick={onClick}
      onPointerEnter={onPointerEnter}
      className={`split-btn ${tone} ${className}`.trim()}
    >
      <SplitBtnLabel ref={labelRef}>{children}</SplitBtnLabel>
      {arrow ? (
        <span className="split-btn__arrow" aria-hidden="true">
          <span className="split-btn__icon">←</span>
        </span>
      ) : null}
    </Comp>
  );
}
