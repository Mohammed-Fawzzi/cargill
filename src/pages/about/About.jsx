import React, { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, useScroll } from "framer-motion";
import Seo from "@/components/seo/Seo";
import Loading from "@/components/loading/Loading";
import SafeImage from "@/components/ui/SafeImage";
import AccentHeading from "@/components/ui/AccentHeading";
import LogoTriangle from "@/components/ui/LogoTriangle";
import ScrollWords from "@/components/ui/ScrollWords";
import GrowTogetherBanner from "@/components/home/GrowTogetherBanner";
import useMotionPrefs from "@/hooks/useMotionPrefs";
import useCountUp from "@/hooks/useCountUp";
import { EmptyState, ErrorState } from "@/components/ui/StatusMessage";
import { getCategories } from "@/services/cms/products";
import { useLocale } from "@/context/LocaleContext";
import { useSiteData } from "@/context/SiteDataContext";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";
import { easeOut } from "@/lib/motion";

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

function ExperienceCard({ locale, reducedMotion, isMobile }) {
  const cardRef = useRef(null);
  const [active, setActive] = useState(false);
  const counted = useCountUp(20, active, 900);
  const value = reducedMotion ? 20 : counted;

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

  return (
    <div
      ref={cardRef}
      className="relative flex h-[360px] items-center justify-center overflow-hidden rounded-[24px] border border-white/8 bg-[#110E33] sm:h-[440px]"
    >
      <div className="absolute inset-0 flex items-center justify-center">
        {reducedMotion ? (
          <LogoTriangle className="w-[280px]" />
        ) : (
          <Suspense fallback={<LogoTriangle className="w-[280px]" />}>
            <BrandTriangle3D
              className="h-[70%] w-[75%] max-w-[280px]"
              softLight
              spin={0.16}
              followMouse={!isMobile}
            />
          </Suspense>
        )}
      </div>
      <div className="absolute inset-x-6 bottom-6 z-10 rounded-[14px] border border-white/12 bg-[rgba(10,8,32,0.75)] px-5 py-5">
        <p
          className="font-display text-[64px] font-black leading-none text-brand-lime"
          dir="ltr"
        >
          +{value}
        </p>
        <p className="mt-1.5 text-[15px] text-white/78">
          {t(UI.experienceBody, locale)}
        </p>
      </div>
    </div>
  );
}

export default function About() {
  const { locale } = useLocale();
  const { reducedMotion } = useMotionPrefs();
  const { contact, isPending, isError } = useSiteData();
  const isMobile = useIsMobile();
  const aboutRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: aboutRef,
    offset: ["start 0.85", "end 0.35"],
  });

  const categoriesQuery = useQuery({
    queryKey: ["cms", "categories"],
    queryFn: getCategories,
    staleTime: 1000 * 60 * 5,
  });

  const aboutHeading = t(contact?.aboutHeading, locale);
  const about = t(contact?.about, locale);
  const vision = t(contact?.vision, locale);
  const mission = t(contact?.mission, locale);
  const bannerUrl = contact?.bannerUrl || "";
  const categories = categoriesQuery.data || [];

  const titleText =
    aboutHeading || t(UI.aboutPageTitle, locale) || t(UI.nav.about, locale);

  const hasContent = Boolean(about || vision || mission || categories.length);

  return (
    <>
      <Seo
        title={titleText}
        description={about || vision || mission}
        path="/about"
      />
      {isPending ? <Loading /> : null}
      {!isPending && isError ? <ErrorState /> : null}
      {!isPending && !isError ? (
        <main className="min-h-screen bg-[#0A0820] text-white">
          <header className="mx-auto max-w-[1320px] px-6 pb-14 pt-[calc(var(--navbar-height)+var(--ticker-height)+3.5rem)] md:pb-[56px] md:pt-[calc(var(--navbar-height)+var(--ticker-height)+4.5rem)]">
            <div className="flex items-center gap-4 text-[14px] text-white/62">
              <nav aria-label="Breadcrumb" className="shrink-0">
                <ol className="flex flex-wrap items-center gap-x-2">
                  <li>
                    <Link to="/" className="transition-colors hover:text-brand-lime">
                      {t(UI.nav.home, locale)}
                    </Link>
                  </li>
                  <li aria-hidden="true">/</li>
                  <li>{t(UI.nav.about, locale)}</li>
                </ol>
              </nav>
              <span className="h-px flex-1 bg-white/14" aria-hidden="true" />
            </div>

            <div className="mt-7 flex flex-wrap items-end justify-between gap-8">
              <div className="min-w-0 flex-1">
                <div className="overflow-hidden py-[0.1em]">
                  <motion.div
                    initial={reducedMotion ? false : { y: "110%" }}
                    animate={{ y: "0%" }}
                    transition={{ duration: 0.65, ease: easeOut }}
                  >
                    <AccentHeading
                      as="h1"
                      text={titleText}
                      className="max-w-full break-words font-display text-[clamp(2.75rem,8.5vw,7.5rem)] font-black leading-[1.1] text-white"
                    />
                  </motion.div>
                </div>
                <p className="mt-[22px] max-w-[560px] text-[18px] leading-[1.7] text-white/72 md:text-[20px]">
                  {t(UI.aboutIntro, locale)}
                </p>
              </div>
              <div
                className="flex items-center gap-2.5 font-mono text-[13px] tracking-[3px] text-white/70"
                dir="ltr"
              >
                <LogoTriangle className="h-3 w-3.5" />
                {UI.pageLabel.about}
              </div>
            </div>
          </header>

          {bannerUrl ? (
            <div className="mx-auto max-w-[1320px] px-6">
              <div className="relative h-[280px] overflow-hidden rounded-[20px] border border-white/8 bg-[#110E33] sm:h-[420px]">
                <SafeImage
                  src={bannerUrl}
                  alt=""
                  width={1400}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          ) : null}

          {!hasContent ? (
            <EmptyState />
          ) : (
            <>
              {about ? (
                <motion.section
                  className="mx-auto grid max-w-[1320px] grid-cols-1 items-center gap-12 px-6 pb-[60px] pt-[100px] md:grid-cols-[7fr_5fr] md:gap-16"
                  initial={reducedMotion ? false : { opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.5, ease: easeOut }}
                >
                  <div>
                    <div className="flex items-center gap-4 text-[14px] text-white/70">
                      <span>{t(UI.whoWeAre, locale)}</span>
                      <span className="h-px flex-1 bg-white/14" aria-hidden="true" />
                      <span className="font-mono text-brand-lime" dir="ltr">
                        § 01
                      </span>
                    </div>
                    <div ref={aboutRef} className="mt-[30px]">
                      <ScrollWords
                        text={about}
                        progress={scrollYProgress}
                        reducedMotion={reducedMotion}
                        mobile={isMobile}
                        accentPhrase
                        className="text-[clamp(1.25rem,2.6vw,1.6875rem)] font-medium leading-[1.8] text-white/62"
                      />
                    </div>
                  </div>
                  <ExperienceCard
                    locale={locale}
                    reducedMotion={reducedMotion}
                    isMobile={isMobile}
                  />
                </motion.section>
              ) : null}

              {(vision || mission) && (
                <section className="mx-auto max-w-[1320px] px-6 py-10">
                  {vision ? (
                    <motion.div
                      className="grid grid-cols-1 items-start gap-6 border-b border-white/12 py-11 md:grid-cols-[2fr_7fr_2fr] md:gap-8"
                      initial={reducedMotion ? false : { opacity: 0, y: 24 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.2 }}
                      transition={{ duration: 0.5, ease: easeOut }}
                    >
                      <div>
                        <span
                          className="font-mono text-[13px] text-brand-lime"
                          dir="ltr"
                        >
                          02
                        </span>
                        <h2 className="mt-2 font-display text-[clamp(2rem,5vw,2.75rem)] font-black leading-none">
                          {t(UI.ourVision, locale)}
                        </h2>
                      </div>
                      <p className="whitespace-pre-wrap text-[20px] leading-[1.7] text-white/85 md:text-[24px]">
                        {vision}
                      </p>
                      <div>
                        <span className="inline-block rounded-full border border-white/30 px-3.5 py-1.5 text-[13px]">
                          {t(UI.valuesTagVision, locale)}
                        </span>
                      </div>
                    </motion.div>
                  ) : null}

                  {mission ? (
                    <motion.div
                      className="grid grid-cols-1 items-start gap-6 border-b border-white/12 py-11 md:grid-cols-[2fr_7fr_2fr] md:gap-8"
                      initial={reducedMotion ? false : { opacity: 0, y: 24 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.2 }}
                      transition={{ duration: 0.5, ease: easeOut }}
                    >
                      <div>
                        <span
                          className="font-mono text-[13px] text-brand-lime"
                          dir="ltr"
                        >
                          03
                        </span>
                        <h2 className="mt-2 font-display text-[clamp(2rem,5vw,2.75rem)] font-black leading-none">
                          {t(UI.ourMission, locale)}
                        </h2>
                      </div>
                      <p className="whitespace-pre-wrap text-[20px] leading-[1.7] text-white/85 md:text-[24px]">
                        {mission}
                      </p>
                      <div>
                        <span className="inline-block rounded-full border border-white/30 px-3.5 py-1.5 text-[13px]">
                          {t(UI.valuesTagMission, locale)}
                        </span>
                      </div>
                    </motion.div>
                  ) : null}
                </section>
              )}

              {categories.length > 0 ? (
                <motion.section
                  className="mx-auto max-w-[1320px] px-6 pb-10 pt-[60px]"
                  initial={reducedMotion ? false : { opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.12 }}
                  transition={{ duration: 0.5, ease: easeOut }}
                >
                  <div className="flex items-center gap-4 text-[14px] text-white/70">
                    <span>{t(UI.whatWeOffer, locale)}</span>
                    <span className="h-px flex-1 bg-white/14" aria-hidden="true" />
                    <span className="font-mono text-brand-lime" dir="ltr">
                      § 04
                    </span>
                  </div>
                  <div className="mt-4">
                    {categories.map((item, index) => (
                      <Link
                        key={item.id}
                        to={`/products?section=${encodeURIComponent(item.id)}`}
                        className="group flex items-center justify-between gap-4 border-b border-white/12 py-[26px] text-white"
                      >
                        <span className="flex items-baseline gap-5">
                          <span
                            className="font-mono text-[13px] text-brand-lime"
                            dir="ltr"
                          >
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <span className="font-display text-[clamp(1.75rem,4vw,2.5rem)] font-extrabold transition-colors group-hover:text-brand-lime">
                            {t(item.name, locale)}
                          </span>
                        </span>
                        <span
                          className="text-[22px] transition-transform duration-300 group-hover:-translate-x-1 rtl:group-hover:translate-x-1"
                          aria-hidden="true"
                        >
                          ←
                        </span>
                      </Link>
                    ))}
                  </div>
                </motion.section>
              ) : null}

              <div className="mt-10">
                <GrowTogetherBanner />
              </div>
            </>
          )}
        </main>
      ) : null}
    </>
  );
}
