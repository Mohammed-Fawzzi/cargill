import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useLocale } from "@/context/LocaleContext";
import { useSiteData } from "@/context/SiteDataContext";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";
import { easeOut } from "@/lib/motion";

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  return reduced;
}

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

function accentLastWord(text) {
  const words = String(text || "")
    .trim()
    .split(/(\s+)/);
  if (words.length === 0) return null;
  let lastIndex = -1;
  for (let i = words.length - 1; i >= 0; i -= 1) {
    if (words[i].trim()) {
      lastIndex = i;
      break;
    }
  }
  return words.map((part, index) => {
    if (index !== lastIndex) return <span key={index}>{part}</span>;
    return (
      <span key={index} className="text-brand-lime">
        {part}
      </span>
    );
  });
}

function ScrollWords({ text, progress, reducedMotion, mobile }) {
  const words = useMemo(
    () =>
      String(text || "")
        .trim()
        .split(/\s+/)
        .filter(Boolean),
    [text],
  );

  if (!text) return null;

  if (reducedMotion || mobile) {
    return (
      <p className="text-[20px] font-medium leading-[1.8] text-brand-ink/85 sm:text-[22px]">
        {text}
      </p>
    );
  }

  return (
    <p className="text-[20px] font-medium leading-[1.8] text-brand-ink sm:text-[22px]">
      {words.map((word, index) => (
        <Word
          key={`${word}-${index}`}
          word={word}
          index={index}
          total={words.length}
          progress={progress}
        />
      ))}
    </p>
  );
}

function Word({ word, index, total, progress }) {
  const start = index / total;
  const end = (index + 0.85) / total;
  const opacity = useTransform(progress, [start, end], [0.25, 1]);

  return (
    <motion.span style={{ opacity }} className="inline">
      {word}
      {index < total - 1 ? " " : ""}
    </motion.span>
  );
}

function IndexRow({ number, title, body, tag }) {
  return (
    <div className="group relative border-y border-brand-ink/15 py-7 transition-colors sm:py-8">
      <span
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px origin-right scale-x-0 bg-brand-lime transition-transform duration-300 group-hover:scale-x-100"
        aria-hidden="true"
      />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:items-start md:gap-6">
        <p className="text-[11px] font-bold tracking-[0.2em] text-brand-lime md:col-span-2">
          {number}
        </p>
        <h3 className="text-2xl font-extrabold tracking-tight text-brand-ink transition-transform duration-300 group-hover:translate-x-0 md:col-span-3 md:text-[2rem] rtl:group-hover:-translate-x-2 ltr:group-hover:translate-x-2">
          {title}
        </h3>
        <p className="text-lg leading-8 text-text-muted md:col-span-6">
          {body}
        </p>
        {tag ? (
          <div className="md:col-span-1 md:justify-self-end">
            <span className="inline-flex border border-brand-ink/25 px-2.5 py-1 text-[11px] font-bold tracking-wide text-brand-ink">
              {tag}
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function ValuesTrio() {
  const { locale } = useLocale();
  const { contact } = useSiteData();
  const reducedMotion = usePrefersReducedMotion();
  const isMobile = useIsMobile();
  const paragraphRef = useRef(null);

  const about = t(contact?.about, locale);
  const vision = t(contact?.vision, locale);
  const mission = t(contact?.mission, locale);
  const heading = t(UI.valuesTitle, locale);

  const { scrollYProgress } = useScroll({
    target: paragraphRef,
    offset: ["start 0.85", "end 0.35"],
  });

  if (!about && !vision && !mission) return null;

  return (
    <section className="relative bg-surface-muted py-[4.5rem] sm:py-24 lg:py-[7.5rem]">
      <motion.div
        className="container mx-auto px-4 lg:px-8"
        initial={reducedMotion ? false : { opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.35, ease: easeOut }}
      >
        <div className="mb-8 flex items-center gap-4 sm:mb-10">
          <p className="shrink-0 text-[11px] font-bold tracking-[0.18em] text-brand-ink">
            {t(UI.whoWeAre, locale)}
          </p>
          <span className="h-px flex-1 bg-brand-ink" aria-hidden="true" />
          <p className="shrink-0 text-[11px] font-bold tracking-[0.2em] text-brand-ink/55">
            01
          </p>
        </div>

        <h2 className="mb-10 max-w-5xl text-[clamp(2.25rem,6vw,5.5rem)] font-extrabold leading-[1.05] tracking-tight text-brand-ink sm:mb-14">
          {accentLastWord(heading)}
        </h2>

        <div
          ref={paragraphRef}
          className="mb-16 grid grid-cols-1 gap-10 lg:mb-20 lg:grid-cols-12 lg:gap-8"
        >
          <div className="lg:col-span-7">
            {about ? (
              <ScrollWords
                text={about}
                progress={scrollYProgress}
                reducedMotion={reducedMotion}
                mobile={isMobile}
              />
            ) : null}
          </div>

          <div className="lg:col-span-4 lg:col-start-9">
            <div className="border-t border-brand-lime pt-4">
              <p className="text-5xl font-extrabold tracking-tight text-brand-ink sm:text-6xl lg:text-7xl">
                {t(UI.experienceYears, locale)}
              </p>
              <p className="mt-3 max-w-[14rem] text-sm leading-6 text-text-muted">
                {t(UI.experienceBody, locale)}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-10">
          {vision ? (
            <IndexRow
              number="02"
              title={t(UI.ourVision, locale)}
              body={vision}
              tag={t(UI.valuesTagVision, locale)}
            />
          ) : null}
          {mission ? (
            <IndexRow
              number="03"
              title={t(UI.ourMission, locale)}
              body={mission}
              tag={t(UI.valuesTagMission, locale)}
            />
          ) : null}
        </div>

        <Link
          to="/about"
          className="inline-flex items-center gap-2 border-b-2 border-brand-lime pb-0.5 text-sm font-bold text-brand-ink transition-[border-width,color] hover:border-b-[3px] hover:text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime focus-visible:ring-offset-2"
        >
          <span>{t(UI.learnMoreAbout, locale)}</span>
          <span aria-hidden="true">←</span>
        </Link>
      </motion.div>
    </section>
  );
}
