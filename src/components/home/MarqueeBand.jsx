import React from "react";
import { motion } from "framer-motion";
import { useLocale } from "@/context/LocaleContext";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";

export default function MarqueeBand() {
  const { locale } = useLocale();
  const items = [
    t(UI.nav.products, locale),
    t(UI.impactFarmers, locale),
    t(UI.nav.events, locale),
    t(UI.impactProducts, locale),
    t(UI.nav.articles, locale),
    t(UI.impactRegions, locale),
  ];
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
