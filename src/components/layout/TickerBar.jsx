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
    <div className="ticker-bar relative z-50 overflow-hidden border-b border-white/8 bg-[#181060] text-white">
      <div className="flex w-max animate-ticker items-center gap-10 whitespace-nowrap px-4 py-[9px]">
        {loop.map((item, index) => (
          <span
            key={`${item}-${index}`}
            className="inline-flex items-center gap-10 text-[13px] text-white/78"
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
