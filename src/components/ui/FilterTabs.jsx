import React from "react";

export default function FilterTabs({
  items = [],
  value,
  onChange,
  count,
  countLabel,
}) {
  return (
    <div className="border-b border-brand-ink/15">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div className="flex min-w-0 flex-1 flex-wrap gap-x-6 gap-y-1" role="tablist">
          {items.map((item) => {
            const active = value === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onChange?.(item.id)}
                className={`relative -mb-px pb-3 text-sm transition-colors ${
                  active
                    ? "font-bold text-brand-ink"
                    : "font-medium text-brand-ink/70 hover:text-brand-ink"
                }`}
              >
                {item.label}
                <span
                  className={`absolute inset-x-0 bottom-0 h-0.5 bg-brand-lime transition-opacity ${
                    active ? "opacity-100" : "opacity-0"
                  }`}
                  aria-hidden="true"
                />
              </button>
            );
          })}
        </div>
        {typeof count === "number" && countLabel ? (
          <p className="pb-3 text-xs text-text-muted">
            {count} {countLabel}
          </p>
        ) : null}
      </div>
    </div>
  );
}
