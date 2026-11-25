import React from "react";

export default function LtrText({ children, className = "" }) {
  return (
    <bdi dir="ltr" className={className}>
      {children}
    </bdi>
  );
}
