import React, { lazy, Suspense, useEffect, useRef, useState } from "react";
import { motion, useScroll } from "framer-motion";
import LogoTriangle from "@/components/ui/LogoTriangle";
import AccentHeading from "@/components/ui/AccentHeading";
import ScrollWords from "@/components/ui/ScrollWords";
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

export default function ValuesTrio() {
  const { locale } = useLocale();
  const { contact } = useSiteData();
  const { reducedMotion } = useMotionPrefs();
  const isMobile = useIsMobile();
  const paragraphRef = useRef(null);
  const cardRef = useRef(null);
  const [active, setActive] = useState(false);

  const about = t(contact?.about, locale);
  const heading = t(UI.valuesTitle, locale);
  const counted = useCountUp(20, active, 900);
  const value = reducedMotion ? 20 : counted;

  const { scrollYProgress } = useScroll({
    target: paragraphRef,
    offset: ["start 0.85", "end 0.35"],
  });

  useEffect(() => {
    const node = cardRef.current;
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

  if (!about && !heading) return null;

  return (
    <motion.section
      className="mx-auto max-w-[1320px] px-6 pb-[110px] pt-[130px]"
      initial={reducedMotion ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.5, ease: easeOut }}
    >
      <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-[7fr_5fr] md:gap-16">
        <div>
          <div className="flex items-center gap-4 text-[14px] text-white/70">
            <span>{t(UI.whoWeAre, locale)}</span>
            <span className="h-px flex-1 bg-white/14" aria-hidden="true" />
            <span className="font-mono text-brand-lime" dir="ltr">
              § 02
            </span>
          </div>

          {heading ? (
            <AccentHeading
              as="h2"
              text={heading}
              className="mt-[30px] font-display text-[clamp(2.75rem,8vw,5.25rem)] font-black leading-[1.02] tracking-[-0.02em] text-white md:text-[84px]"
            />
          ) : null}

          {about ? (
            <div ref={paragraphRef} className="mt-[34px]">
              <ScrollWords
                text={about}
                progress={scrollYProgress}
                reducedMotion={reducedMotion}
                mobile={isMobile}
                accentPhrase
                className="text-[clamp(1.125rem,2.4vw,1.5625rem)] font-medium leading-[1.85] text-white/62"
              />
            </div>
          ) : null}
        </div>

        <div
          ref={cardRef}
          className="relative h-[420px] overflow-hidden rounded-[24px] border border-white/8 bg-[#110E33] sm:h-[520px]"
        >
          <div
            className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(140,198,63,0.2),transparent_60%)]"
            aria-hidden="true"
          />

          <div className="absolute start-1/2 top-[42%] h-[58%] w-[78%] max-w-[340px] -translate-x-1/2 -translate-y-1/2 rtl:translate-x-1/2">
            {reducedMotion ? (
              <LogoTriangle className="h-full w-full" />
            ) : (
              <Suspense fallback={<LogoTriangle className="h-full w-full" />}>
                <BrandTriangle3D
                  className="h-full w-full"
                  softLight
                  spin={0.18}
                  followMouse={!isMobile}
                />
              </Suspense>
            )}
          </div>

          <div className="absolute inset-x-7 bottom-7 z-10 rounded-[14px] border border-white/12 bg-[rgba(10,8,32,0.72)] px-6 py-[22px] backdrop-blur-[10px]">
            <p
              className="font-display text-[clamp(3rem,8vw,4.5rem)] font-black leading-none text-brand-lime"
              dir="ltr"
            >
              +{value}
            </p>
            <p className="mt-2 text-[16px] text-white/78">
              {t(UI.experienceBody, locale)}
            </p>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
