import React, { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import SectionRule from "@/components/ui/SectionRule";
import ScrollWords from "@/components/ui/ScrollWords";
import RevealHeading from "@/components/ui/RevealHeading";
import AmbientGlow from "@/components/ui/AmbientGlow";
import { TriangleAccent } from "@/components/ui/TriangleMask";
import { useLocale } from "@/context/LocaleContext";
import { useSiteData } from "@/context/SiteDataContext";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";
import { easeOut } from "@/lib/motion";
import useCountUp from "@/hooks/useCountUp";
import useMotionPrefs from "@/hooks/useMotionPrefs";

const BrandTriangle3D = lazy(() => import("@/components/ui/BrandTriangle3D"));

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

function ExperienceBlock({ locale }) {
  const { reducedMotion, canTilt } = useMotionPrefs();
  const isMobile = useIsMobile();
  const ref = useRef(null);
  const [active, setActive] = useState(false);
  const [twist, setTwist] = useState(0);
  const counted = useCountUp(20, active, 900);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const scrollTwist = useTransform(scrollYProgress, [0, 1], [0, 30]);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (reducedMotion || isMobile) {
      setTwist(0);
      return undefined;
    }
    return scrollTwist.on("change", (value) => setTwist(value));
  }, [scrollTwist, reducedMotion, isMobile]);

  const value = reducedMotion ? 20 : counted;
  const use3d = !reducedMotion && !isMobile && canTilt;

  return (
    <div ref={ref} className="relative min-h-[18rem] sm:min-h-[20rem]">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <AmbientGlow className="h-48 w-48 sm:h-56 sm:w-56" />
        {use3d ? (
          <Suspense
            fallback={<TriangleAccent className="h-40 w-48 opacity-35" />}
          >
            <BrandTriangle3D
              className="h-[70%] min-h-[11rem] w-[75%] max-w-[17rem]"
              scrollTwist={twist}
              softLight
              spin={0.12}
              followMouse={false}
            />
          </Suspense>
        ) : (
          <TriangleAccent className="h-36 w-44 opacity-40 sm:h-44 sm:w-52" />
        )}
      </div>

      <div className="relative z-10 flex h-full items-end">
        <div className="w-full border border-white/10 bg-[rgba(17,14,51,0.7)] p-5 backdrop-blur-md sm:p-6">
          <p className="text-5xl font-extrabold tracking-tight text-brand-lime sm:text-6xl lg:text-7xl">
            +{value}
          </p>
          <p className="mt-3 max-w-[16rem] text-sm leading-6 text-ink/65">
            {t(UI.experienceBody, locale)}
          </p>
        </div>
      </div>
    </div>
  );
}

function IndexRow({ number, title, body, tag }) {
  return (
    <div className="group relative border-y border-line/15 py-7 transition-colors sm:py-8">
      <span
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px origin-right scale-x-0 bg-brand-lime transition-transform duration-300 group-hover:scale-x-100"
        aria-hidden="true"
      />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:items-start md:gap-6">
        <p className="font-mono text-[11px] font-medium tracking-[0.2em] text-brand-lime md:col-span-2">
          {number}
        </p>
        <h3 className="text-2xl font-extrabold tracking-tight text-ink transition-transform duration-300 group-hover:translate-x-0 md:col-span-3 md:text-[2rem] rtl:group-hover:-translate-x-2 ltr:group-hover:translate-x-2">
          {title}
        </h3>
        <p className="text-lg leading-8 text-text-muted md:col-span-6">{body}</p>
        {tag ? (
          <div className="md:col-span-1 md:justify-self-end">
            <span className="inline-flex border border-line/25 px-2.5 py-1 text-[11px] font-bold tracking-wide text-ink">
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
  const { reducedMotion } = useMotionPrefs();
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
    <section className="relative overflow-hidden bg-page py-[4.5rem] lg:py-[7.5rem]">
      <motion.div
        className="container mx-auto px-4 lg:px-8"
        initial={reducedMotion ? false : { opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.35, ease: easeOut }}
      >
        <SectionRule
          className="mb-8 flex items-center gap-4 sm:mb-10"
          label={t(UI.whoWeAre, locale)}
          number="01"
          labelClassName="text-ink"
          numberClassName="text-ink/55"
          lineClassName="bg-ink"
        />

        <RevealHeading
          text={heading}
          className="text-clip-safe mb-10 max-w-5xl text-[clamp(2.25rem,6vw,5.5rem)] font-extrabold leading-[1.12] tracking-tight text-ink sm:mb-14"
        />

        <div
          ref={paragraphRef}
          className="mb-10 grid grid-cols-1 gap-10 lg:mb-12 lg:grid-cols-12 lg:gap-8"
        >
          <div className="lg:col-span-7">
            {about ? (
              <ScrollWords
                text={about}
                progress={scrollYProgress}
                reducedMotion={reducedMotion}
                mobile={isMobile}
                accentPhrase
              />
            ) : null}
          </div>

          <div className="lg:col-span-4 lg:col-start-9">
            <ExperienceBlock locale={locale} />
          </div>
        </div>

        <div className="mb-8">
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
          className="inline-flex items-center gap-2 border-b-2 border-brand-lime pb-0.5 text-sm font-bold text-ink transition-[border-width,color] hover:border-b-[3px] hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime focus-visible:ring-offset-2"
        >
          <span>{t(UI.learnMoreAbout, locale)}</span>
          <span aria-hidden="true">←</span>
        </Link>
      </motion.div>
    </section>
  );
}
