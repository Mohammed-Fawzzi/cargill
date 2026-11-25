import React from "react";

export default function ContentGrid({ count = 0, children }) {
  const layout =
    count === 1 ? "grid-cols-1" : count === 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

  return <div className={`grid gap-8 lg:gap-10 ${layout}`}>{children}</div>;
}

export function cardLayoutForCount(count) {
  return count === 1 ? "horizontal" : "default";
}
