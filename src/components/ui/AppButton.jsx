import React from "react";
import { Link } from "react-router-dom";
import { isExternalHref } from "@/components/ui/CtaLink";
import MagneticButton from "@/components/ui/MagneticButton";

function Arrow({ className = "" }) {
  return (
    <span
      className={`inline-block transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0 ${className}`}
      aria-hidden="true"
    >
      →
    </span>
  );
}

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

export function PrimaryButton({
  children,
  to,
  href,
  type,
  disabled,
  className = "",
  onClick,
}) {
  const { Comp, props } = resolveElement({ to, href, type, disabled });

  return (
    <MagneticButton strength={6} className="inline-flex">
      <Comp
        {...props}
        onClick={onClick}
        className={`group inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-brand-lime px-6 py-2.5 text-sm font-bold text-brand-navy transition-colors hover:bg-brand-lime-hover disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
      >
        <span>{children}</span>
        <Arrow />
      </Comp>
    </MagneticButton>
  );
}

export function SecondaryButton({
  children,
  to,
  href,
  type,
  disabled,
  className = "",
  onClick,
}) {
  const { Comp, props } = resolveElement({ to, href, type, disabled });

  return (
    <Comp
      {...props}
      onClick={onClick}
      className={`group inline-flex items-center gap-2 text-sm font-bold text-ink underline decoration-brand-lime decoration-2 underline-offset-6 transition-colors hover:text-brand-moss disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
    >
      <span>{children}</span>
      <Arrow />
    </Comp>
  );
}
