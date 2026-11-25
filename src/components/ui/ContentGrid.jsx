import React from "react";

export default function ContentGrid({ children }) {
  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">
      {children}
    </div>
  );
}

export function cardLayoutForCount() {
  return "default";
}
