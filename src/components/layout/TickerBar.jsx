import React, { useMemo } from "react";
import { useLocale } from "@/context/LocaleContext";
import { TICKER_ITEMS } from "@/constants/cinematic";
import { t } from "@/lib/i18n";

export default function TickerBar({ items: itemsProp } = {}) {
  const { locale } = useLocale();
  const items = useMemo(() => {
    const source = itemsProp?.length ? itemsProp : TICKER_ITEMS;
    return source.map((item) => t(item, locale) || item).filter(Boolean);
  }, [itemsProp, locale]);

  if (!items.length) return null;

  const loop = [...items, ...items];

  return (
    <div className="ticker-bar relative z-50 overflow-hidden border-b border-line/10 bg-surface text-ink">
      <div className="flex w-max animate-ticker items-center gap-8 whitespace-nowrap py-1.5 pe-8">
        {loop.map((item, index) => (
          <span
            key={`${item}-${index}`}
            className="inline-flex items-center gap-8 font-mono text-[11px] font-medium tracking-[0.14em] text-ink/70"
          >
            <span>{item}</span>
            <span className="text-brand-lime" aria-hidden="true">
              ▲
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
