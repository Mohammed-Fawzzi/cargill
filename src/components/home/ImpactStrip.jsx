import React from "react";
import { motion } from "framer-motion";
import Reveal from "@/components/ui/Reveal";
import { useLocale } from "@/context/LocaleContext";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";
import { easeOut } from "@/lib/motion";

const STATS = [
  { value: "25+", label: UI.impactYears },
  { value: "120+", label: UI.impactProducts },
  { value: "14", label: UI.impactRegions },
  { value: "8K+", label: UI.impactFarmers },
];

export default function ImpactStrip() {
  const { locale } = useLocale();

  return (
    <section className="relative overflow-hidden bg-brand-forest-deep py-16 text-white lg:py-20">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_40%,rgba(136,196,60,0.18),transparent_35%),radial-gradient(circle_at_85%_60%,rgba(255,255,255,0.06),transparent_40%)]"
        aria-hidden="true"
      />
      <div className="relative container mx-auto px-4 lg:px-8">
        <Reveal className="mb-10 max-w-2xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-brand-lime">
            {t(UI.impactEyebrow, locale)}
          </p>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-[2.75rem]">
            {t(UI.impactTitle, locale)}
          </h2>
        </Reveal>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {STATS.map((item, index) => (
            <motion.div
              key={item.value}
              className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm sm:p-6"
              initial={{ opacity: 0, y: 28, rotateX: 18 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.55, ease: easeOut, delay: index * 0.08 }}
              style={{ transformStyle: "preserve-3d" }}
            >
              <p className="mb-2 text-3xl font-extrabold text-brand-lime sm:text-4xl">
                {item.value}
              </p>
              <p className="text-sm leading-7 text-white/75 sm:text-base">
                {t(item.label, locale)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
