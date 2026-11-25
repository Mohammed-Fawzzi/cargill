import React from "react";
import { Link } from "react-router-dom";
import { isExternalHref } from "@/components/ui/CtaLink";

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

  return (
    <Comp
      {...props}
      onClick={onClick}
      className={`split-btn ${tone} ${className}`.trim()}
    >
      <span className="split-btn__label">{children}</span>
      {arrow ? (
        <span className="split-btn__orbit" aria-hidden="true">
          <span className="split-btn__arrow">←</span>
        </span>
      ) : null}
    </Comp>
  );
}
