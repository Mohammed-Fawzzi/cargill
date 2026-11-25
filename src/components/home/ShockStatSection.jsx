import React, { useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, useScroll, useTransform } from "framer-motion";
import SafeImage from "@/components/ui/SafeImage";
import MonoLabel from "@/components/ui/MonoLabel";
import PlantStroke from "@/components/ui/PlantStroke";
import { useLocale } from "@/context/LocaleContext";
import { getShockStat } from "@/services/cms/editorial";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";
import useMotionPrefs from "@/hooks/useMotionPrefs";

function Letter({ letter, progress, start, end }) {
  const opacity = useTransform(progress, [start, end], [0.18, 1]);
  return (
    <motion.span style={{ opacity }} className="inline">
      {letter === " " ? "\u00A0" : letter}
    </motion.span>
  );
}

function LetterReveal({ text, progress, reducedMotion }) {
  const letters = useMemo(() => Array.from(String(text || "")), [text]);
  if (!text) return null;
  if (reducedMotion) return <span>{text}</span>;
  return (
    <span className="inline">
      {letters.map((letter, index) => {
        const start = index / Math.max(letters.length, 1);
        const end = Math.min(1, start + 0.08);
        return (
          <Letter
            key={`${letter}-${index}`}
            letter={letter}
            progress={progress}
            start={start}
            end={end}
          />
        );
      })}
    </span>
  );
}

export default function ShockStatSection() {
  const { locale } = useLocale();
  const { reducedMotion } = useMotionPrefs();
  const ref = useRef(null);
  const query = useQuery({
    queryKey: ["cms", "editorial", "shock_stat"],
    queryFn: getShockStat,
    staleTime: 1000 * 60 * 10,
  });

  const statement = t(query.data?.statement, locale);
  const source = t(query.data?.source, locale);
  const imageUrl = query.data?.imageUrl || "";

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "end 0.35"],
  });
  const plantY = useTransform(scrollYProgress, [0, 1], [28, 0]);

  if (!statement || !imageUrl) return null;

  return (
    <section ref={ref} className="bg-page">
      <div className="grid min-h-[70vh] grid-cols-1 lg:grid-cols-2">
        <div className="relative min-h-[42vh] overflow-hidden bg-brand-navy lg:min-h-full">
          <SafeImage
            src={imageUrl}
            alt=""
            className="cinema-grade-open absolute inset-0 h-full w-full object-cover"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-brand-navy/30 mix-blend-multiply" />
        </div>

        <div className="relative flex flex-col justify-center border-t border-[#181060]/10 bg-[#F3F0E8] px-6 py-14 text-[#181060] lg:border-t-0 lg:border-s lg:px-12 lg:py-20">
          <MonoLabel className="mb-6 text-[#181060]/55">
            {t(UI.shockStatLabel, locale)}
          </MonoLabel>
          <p className="max-w-xl text-[clamp(1.75rem,4vw,3.25rem)] font-extrabold leading-[1.2] tracking-tight">
            <LetterReveal
              text={statement}
              progress={scrollYProgress}
              reducedMotion={reducedMotion}
            />
          </p>
          {source ? (
            <p className="mt-6 font-mono text-[11px] tracking-[0.16em] text-[#181060]/55">
              — {source}
            </p>
          ) : null}
          <motion.div
            className="mt-10 text-[#181060]/45"
            style={reducedMotion ? undefined : { y: plantY }}
          >
            <PlantStroke className="h-24 w-12" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
