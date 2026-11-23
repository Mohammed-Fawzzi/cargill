import React from "react";
import { Link } from "react-router-dom";

export function isExternalHref(href) {
  const value = String(href || "").trim();
  return /^(https?:|mailto:|tel:)/i.test(value);
}

export default function CtaLink({
  href,
  children,
  className = "",
  onClick,
}) {
  const to = String(href || "").trim();
  if (!to || !children) return null;

  if (isExternalHref(to)) {
    const external = /^https?:/i.test(to);
    return (
      <a
        href={to}
        className={className}
        onClick={onClick}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {children}
      </a>
    );
  }

  return (
    <Link to={to} className={className} onClick={onClick}>
      {children}
    </Link>
  );
}
