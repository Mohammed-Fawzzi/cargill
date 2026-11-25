import React from "react";
import SplitArrowButton from "@/components/ui/SplitArrowButton";

export function PrimaryButton({
  children,
  to,
  href,
  type,
  disabled,
  className = "",
  onClick,
}) {
  return (
    <SplitArrowButton
      to={to}
      href={href}
      type={type}
      disabled={disabled}
      variant="primary"
      className={className}
      onClick={onClick}
    >
      {children}
    </SplitArrowButton>
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
  return (
    <SplitArrowButton
      to={to}
      href={href}
      type={type}
      disabled={disabled}
      variant="secondary"
      className={className}
      onClick={onClick}
    >
      {children}
    </SplitArrowButton>
  );
}
