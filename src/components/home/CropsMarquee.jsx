import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TriangleAccent } from "@/components/ui/TriangleMask";
import { useLocale } from "@/context/LocaleContext";
import { getProducts } from "@/services/cms/products";
import { CROP_MARQUEE_FALLBACK } from "@/constants/cinematic";
import { t } from "@/lib/i18n";

export default function CropsMarquee() {
  const { locale } = useLocale();
  const [paused, setPaused] = useState(false);
  const [hoverIndex, setHoverIndex] = useState(-1);

  const productsQuery = useQuery({
    queryKey: ["cms", "products"],
    queryFn: getProducts,
    staleTime: 1000 * 60 * 5,
  });

  const crops = useMemo(() => {
    const set = new Set();
    for (const product of productsQuery.data || []) {
      for (const row of product.agriculturalUses || []) {
        const crop = t(row.cells?.crop, locale);
        if (crop) set.add(crop);
      }
    }
    const fromData = Array.from(set);
    if (fromData.length >= 4) return fromData.slice(0, 12);
    return CROP_MARQUEE_FALLBACK.map((item) => t(item, locale));
  }, [productsQuery.data, locale]);

  const loop = [...crops, ...crops];

  return (
    <section
      className="overflow-hidden border-y border-line/10 bg-page py-8 lg:py-12"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => {
        setPaused(false);
        setHoverIndex(-1);
      }}
    >
      <div
        className={`flex w-max items-center gap-8 whitespace-nowrap pe-8 ${
          paused ? "" : "animate-ticker-slow"
        }`}
      >
        {loop.map((crop, index) => {
          const active = hoverIndex === index;
          return (
            <button
              key={`${crop}-${index}`}
              type="button"
              onMouseEnter={() => setHoverIndex(index)}
              className="inline-flex items-center gap-8 bg-transparent"
            >
              <span
                className={`crops-outline text-[clamp(2.5rem,8vw,6.5rem)] font-extrabold leading-none tracking-tight transition-colors duration-300 ${
                  active ? "text-brand-lime" : "text-transparent"
                }`}
                style={
                  active
                    ? undefined
                    : { WebkitTextStroke: "1px rgba(255,255,255,0.3)" }
                }
              >
                {crop}
              </span>
              <TriangleAccent className="h-3 w-3.5 shrink-0 text-brand-lime opacity-80" />
            </button>
          );
        })}
      </div>
    </section>
  );
}
