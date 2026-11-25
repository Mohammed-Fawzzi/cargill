import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import AmbientGlow from "@/components/ui/AmbientGlow";
import AccentHeading from "@/components/ui/AccentHeading";
import MonoLabel from "@/components/ui/MonoLabel";
import { useLocale } from "@/context/LocaleContext";
import { HOW_WE_WORK_STEPS } from "@/constants/cinematic";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";
import { easeOut } from "@/lib/motion";
import useMotionPrefs from "@/hooks/useMotionPrefs";

function StepIcon({ type }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.25,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  if (type === "soil") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <path {...common} d="M4 18h16M6 18c1-4 3-7 6-7s5 3 6 7M12 11V6" />
      </svg>
    );
  }
  if (type === "program") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <path {...common} d="M5 7h14M5 12h10M5 17h7" />
      </svg>
    );
  }
  if (type === "field") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <path {...common} d="M4 19h16M7 19V9l5-4 5 4v10" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path {...common} d="M12 4v4M8 20h8M7 14c1.5-3 3-5 5-5s3.5 2 5 5" />
    </svg>
  );
}

export default function HowWeWork() {
  const { locale } = useLocale();
  const { reducedMotion } = useMotionPrefs();
  const lineRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: lineRef,
    offset: ["start 0.85", "end 0.55"],
  });
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section className="relative overflow-hidden bg-page py-[4.5rem] lg:py-[7rem]">
      <AmbientGlow className="-end-24 top-10 h-72 w-72" />
      <div className="relative container mx-auto px-4 lg:px-8">
        <MonoLabel index={2} className="mb-4 text-brand-lime/80">
          PROCESS
        </MonoLabel>
        <AccentHeading
          text={t(UI.howWeWork, locale)}
          className="text-clip-safe mb-12 max-w-3xl text-[clamp(2rem,5vw,3.75rem)] font-extrabold leading-[1.1] tracking-tight text-ink"
        />

        <div ref={lineRef} className="relative">
          <div
            className="pointer-events-none absolute start-0 end-0 top-[1.65rem] hidden h-px bg-line/15 lg:block"
            aria-hidden="true"
          />
          <motion.div
            className="pointer-events-none absolute start-0 end-0 top-[1.65rem] hidden h-px origin-right bg-brand-lime lg:block rtl:origin-left"
            style={reducedMotion ? { scaleX: 1 } : { scaleX }}
            aria-hidden="true"
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {HOW_WE_WORK_STEPS.map((step, index) => (
              <motion.article
                key={step.icon}
                className="group relative border border-line/12 bg-surface p-5 transition-colors duration-300 hover:border-brand-lime"
                initial={reducedMotion ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.06,
                  ease: easeOut,
                }}
              >
                <p className="mb-5 font-mono text-[11px] tracking-[0.2em] text-ink/40">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <div className="mb-4 text-ink/60">
                  <StepIcon type={step.icon} />
                </div>
                <h3 className="mb-2 text-lg font-extrabold tracking-tight text-ink">
                  {t(step.title, locale)}
                </h3>
                <p className="text-sm leading-7 text-ink/55">
                  {t(step.body, locale)}
                </p>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
