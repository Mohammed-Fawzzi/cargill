import React, { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, useScroll, useTransform } from "framer-motion";
import SafeImage from "@/components/ui/SafeImage";
import MonoLabel from "@/components/ui/MonoLabel";
import { useLocale } from "@/context/LocaleContext";
import { getSeedToHarvest } from "@/services/cms/editorial";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";
import useMotionPrefs from "@/hooks/useMotionPrefs";

function useIsMobile(breakpoint = 768) {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const sync = () => setMobile(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, [breakpoint]);
  return mobile;
}

export default function SeedToHarvest() {
  const { locale } = useLocale();
  const { reducedMotion } = useMotionPrefs();
  const isMobile = useIsMobile();
  const pinRef = useRef(null);
  const query = useQuery({
    queryKey: ["cms", "editorial", "seed_to_harvest"],
    queryFn: getSeedToHarvest,
    staleTime: 1000 * 60 * 10,
  });

  const stages = useMemo(
    () => (query.data?.stages || []).filter((item) => item?.imageUrl),
    [query.data],
  );

  const { scrollYProgress } = useScroll({
    target: pinRef,
    offset: ["start start", "end end"],
  });

  const [active, setActive] = useState(0);
  useEffect(() => {
    if (reducedMotion || isMobile || stages.length < 3) return undefined;
    return scrollYProgress.on("change", (value) => {
      const index = Math.min(
        stages.length - 1,
        Math.floor(value * stages.length),
      );
      setActive(index);
    });
  }, [scrollYProgress, stages.length, reducedMotion, isMobile]);

  const lineScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  if (stages.length < 3) return null;

  if (isMobile || reducedMotion) {
    return (
      <section className="bg-page py-[4.5rem] lg:py-[7rem]">
        <div className="container mx-auto px-4 lg:px-8">
          <MonoLabel className="mb-6 text-brand-lime/80">
            {t(UI.seedHarvestLabel, locale)}
          </MonoLabel>
          <div className="space-y-6">
            {stages.map((stage, index) => (
              <article key={stage.id || index} className="border border-line/12">
                <div className="relative aspect-[16/10] overflow-hidden bg-surface">
                  <SafeImage
                    src={stage.imageUrl}
                    alt={t(stage.label, locale)}
                    className="cinema-grade-open h-full w-full object-cover"
                  />
                </div>
                <p className="border-t border-line/10 px-4 py-3 font-mono text-[11px] tracking-[0.18em] text-ink/70">
                  {String(index + 1).padStart(2, "0")} — {t(stage.label, locale)}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={pinRef} className="relative bg-page" style={{ height: `${stages.length * 100}vh` }}>
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <div className="container mx-auto w-full px-4 lg:px-8">
          <MonoLabel className="mb-6 text-brand-lime/80">
            {t(UI.seedHarvestLabel, locale)}
          </MonoLabel>
          <div className="relative aspect-[16/9] overflow-hidden border border-line/12 bg-surface">
            {stages.map((stage, index) => (
              <div
                key={stage.id || index}
                className="absolute inset-0 transition-opacity duration-500"
                style={{ opacity: active === index ? 1 : 0 }}
              >
                <SafeImage
                  src={stage.imageUrl}
                  alt={t(stage.label, locale)}
                  className="cinema-grade-open h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-brand-navy/25 mix-blend-multiply" />
              </div>
            ))}
            <div className="absolute inset-x-0 bottom-0 z-10 p-5 sm:p-8">
              <p className="font-mono text-sm tracking-[0.2em] text-white">
                {String(active + 1).padStart(2, "0")} —{" "}
                {t(stages[active]?.label, locale)}
              </p>
              <div className="mt-4 h-px w-full overflow-hidden bg-white/20">
                <motion.div
                  className="h-full origin-right bg-brand-lime rtl:origin-left"
                  style={{ scaleX: lineScale }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
