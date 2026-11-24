import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useLocale } from "@/context/LocaleContext";
import { getCategories, getProducts } from "@/services/cms/products";
import { t } from "@/lib/i18n";

export default function MarqueeBand() {
  const { locale } = useLocale();
  const categoriesQuery = useQuery({
    queryKey: ["cms", "categories"],
    queryFn: getCategories,
    staleTime: 1000 * 60 * 5,
  });
  const productsQuery = useQuery({
    queryKey: ["cms", "products"],
    queryFn: getProducts,
    staleTime: 1000 * 60 * 5,
  });

  const items = useMemo(() => {
    const categories = (categoriesQuery.data || [])
      .map((item) => t(item.name, locale))
      .filter(Boolean);
    const products = (productsQuery.data || [])
      .map((item) => t(item.name, locale))
      .filter(Boolean)
      .slice(0, 8);
    const merged = [...categories, ...products];
    return merged.length ? merged : null;
  }, [categoriesQuery.data, productsQuery.data, locale]);

  if (!items?.length) return null;

  const loop = [...items, ...items];

  return (
    <section className="overflow-hidden border-y border-brand-ink/5 bg-brand-lime py-4">
      <motion.div
        className="flex w-max gap-10 whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 28, ease: "linear", repeat: Infinity }}
      >
        {loop.map((item, index) => (
          <span
            key={`${item}-${index}`}
            className="inline-flex items-center gap-10 text-sm font-extrabold uppercase tracking-[0.18em] text-brand-ink"
          >
            {item}
            <span className="h-2 w-2 rounded-full bg-brand-ink/40" aria-hidden="true" />
          </span>
        ))}
      </motion.div>
    </section>
  );
}
