import React, { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import Seo from "@/components/seo/Seo";
import Loading from "@/components/loading/Loading";
import SafeImage from "@/components/ui/SafeImage";
import LogoTriangle from "@/components/ui/LogoTriangle";
import PageBanner from "@/components/ui/PageBanner";
import GrowTogetherBanner from "@/components/shared/GrowTogetherBanner";
import { useLenis } from "@/components/layout/LenisProvider";
import useMotionPrefs from "@/hooks/useMotionPrefs";
import useCountUp from "@/hooks/useCountUp";
import { EmptyState, ErrorState } from "@/components/ui/StatusMessage";
import { getCategories, getProducts } from "@/services/cms/products";
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
      className="relative mx-auto flex aspect-square w-full max-w-md flex-col justify-between overflow-hidden bg-[#1F1D35] p-7 shadow-[0_24px_60px_rgba(10,8,32,0.45)]"
    >
      <div className="relative z-10 flex flex-1 items-center justify-center py-4">
        {reducedMotion ? (
          <LogoTriangle className="w-[200px] drop-shadow-lg" />
        ) : (
          <Suspense
            fallback={<LogoTriangle className="w-[200px] drop-shadow-lg" />}
          >
            <BrandTriangle3D
              className="h-[70%] w-[75%] max-w-[220px]"
              softLight
              spin={0.16}
              followMouse={!isMobile}
            />
          </Suspense>
        )}
      </div>

      <div className="relative z-10 flex items-end justify-between gap-4 pt-4">
        <p
          className="font-display text-[64px] font-bold leading-none text-brand-lime"
          dir="ltr"
        >
          +{value}
        </p>
        <p className="max-w-[140px] text-start text-[13px] leading-snug text-white/55">
          {t(UI.experienceBody, locale)}
        </p>
      </div>
    </div>
  );
}

function PillarCard({ index, tag, title, body, reducedMotion }) {
  if (!body) return null;

  return (
    <motion.div
      className="flex flex-col items-start justify-between gap-6 bg-[#1F1D35] p-7 transition-colors hover:bg-[#292740] lg:flex-row lg:items-center lg:p-10"
      initial={reducedMotion ? false : { opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, ease: easeOut }}
    >
      <div className="flex max-w-3xl flex-1 flex-col gap-2">
        <div className="mb-1 flex items-center gap-3">
          <span className="bg-[#0D0B23] px-2 py-0.5 text-[11px] font-semibold tracking-wide text-brand-lime">
            {String(index).padStart(2, "0")}
          </span>
          {tag ? (
            <span className="text-[13px] text-white/55">{tag}</span>
          ) : null}
        </div>
        <p className="whitespace-pre-wrap text-base leading-relaxed text-white/85 md:text-lg">
          {body}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-4">
        <span
          className="hidden h-px w-12 bg-brand-lime/30 lg:block"
          aria-hidden="true"
        />
        <span className="font-display text-[22px] font-bold tracking-tight text-white md:text-[30px]">
          {title}
        </span>
      </div>
    </motion.div>
  );
}

function StoryBlock({ label, title, body }) {
  if (!body) return null;
  return (
    <div className="mx-auto max-w-2xl text-center">
      {label ? (
        <p className="mb-3 text-xs font-medium tracking-wide text-brand-lime">
          {label}
        </p>
      ) : null}
      {title ? (
        <h2 className="mb-5 font-display text-3xl font-bold text-white md:text-4xl">
          {title}
        </h2>
      ) : null}
      <p className="whitespace-pre-wrap text-base leading-relaxed text-white/75 md:text-lg">
        {body}
      </p>
    </div>
  );
}

function AboutStoryPinned({ steps, images, reducedMotion }) {
  const pinRef = useRef(null);
  const lenis = useLenis();
  const [active, setActive] = useState(0);
  const count = Math.max(steps.length, 1);

  useEffect(() => {
    const node = pinRef.current;
    if (!node || !steps.length) return undefined;

    const update = () => {
      const rect = node.getBoundingClientRect();
      const travel = Math.max(1, node.offsetHeight - window.innerHeight);
      const scrolled = Math.min(travel, Math.max(0, -rect.top));
      const progress = scrolled / travel;
      const raw = Math.min(count - 1, Math.floor(progress * count + 0.001));
      setActive((prev) => (prev === raw ? prev : raw));
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    const instance = lenis?.instance;
    instance?.on?.("scroll", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      instance?.off?.("scroll", update);
    };
  }, [steps.length, count, lenis]);

  const cornerImages = useMemo(() => {
    const pool = images.filter(Boolean);
    if (!pool.length) return ["", "", "", ""];
    const start = (active * 2) % pool.length;
    const picked = [];
    for (let i = 0; i < 4; i += 1) {
      picked.push(pool[(start + i) % pool.length]);
    }
    return picked;
  }, [images, active]);

  const positions = [
    "start-6 top-24",
    "end-6 top-28",
    "start-10 bottom-16",
    "end-10 bottom-20",
  ];

  return (
    <section
      ref={pinRef}
      className="relative"
      style={{ height: `${count * 120}vh` }}
    >
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          {cornerImages.map((src, index) => (
            <div
              key={`slot-${index}`}
              className={`absolute hidden h-36 w-28 overflow-hidden rounded-2xl border border-white/10 lg:block xl:h-44 xl:w-36 ${positions[index]}`}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${active}-${src}-${index}`}
                  className="absolute inset-0"
                  initial={reducedMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: easeOut }}
                >
                  {src ? (
                    <SafeImage
                      src={src}
                      alt=""
                      width={420}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-[#181060]" />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          ))}
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center px-4 sm:px-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={steps[active]?.id || active}
              className="w-full"
              initial={reducedMotion ? false : { opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: 0.45, ease: easeOut }}
            >
              <StoryBlock
                label={steps[active]?.label}
                title={steps[active]?.title}
                body={steps[active]?.body}
              />
            </motion.div>
          </AnimatePresence>

          <div
            className="mt-10 flex items-center gap-2"
            aria-hidden="true"
          >
            {steps.map((step, index) => (
              <span
                key={step.id}
                className={`h-1.5 rounded-full transition-[width,background-color] duration-300 ${
                  index === active
                    ? "w-7 bg-brand-lime"
                    : "w-1.5 bg-white/25"
                }`}
                style={{
                  transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function About() {
  const { locale } = useLocale();
  const { reducedMotion } = useMotionPrefs();
  const { contact, isPending, isError } = useSiteData();
  const isMobile = useIsMobile();

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

  const aboutHeading = t(contact?.aboutHeading, locale);
  const about = t(contact?.about, locale);
  const vision = t(contact?.vision, locale);
  const mission = t(contact?.mission, locale);
  const bannerUrl = contact?.bannerUrl || "";
  const categories = categoriesQuery.data || [];

  const titleText =
    aboutHeading || t(UI.aboutPageTitle, locale) || t(UI.nav.about, locale);

  const storySteps = useMemo(() => {
    const steps = [];
    if (about) {
      steps.push({
        id: "about",
        label: t(UI.whoWeAre, locale),
        title: titleText,
        body: about,
      });
    }
    if (vision) {
      steps.push({
        id: "vision",
        label: t(UI.valuesTagVision, locale),
        title: t(UI.ourVision, locale),
        body: vision,
      });
    }
    if (mission) {
      steps.push({
        id: "mission",
        label: t(UI.valuesTagMission, locale),
        title: t(UI.ourMission, locale),
        body: mission,
      });
    }
    return steps;
  }, [about, vision, mission, locale, titleText]);

  const storyImages = useMemo(() => {
    const products = productsQuery.data || [];
    const categoryCovers = categories
      .map((category) => {
        if (category.imageUrl) return category.imageUrl;
        return (
          products.find(
            (product) => product.sectionId === category.id && product.imageUrl,
          )?.imageUrl || ""
        );
      })
      .filter(Boolean);
    return [bannerUrl, ...categoryCovers].filter(Boolean).slice(0, 8);
  }, [bannerUrl, categories, productsQuery.data]);

  const hasContent = Boolean(about || vision || mission || categories.length);
  const usePinned = !isMobile && !reducedMotion && storySteps.length > 1;

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
        <main className="min-h-screen bg-transparent text-white">
          <PageBanner
            title={titleText}
            subtitle={t(UI.aboutIntro, locale)}
            label={t(UI.nav.about, locale)}
            breadcrumbs={[
              { label: t(UI.nav.home, locale), to: "/" },
              { label: t(UI.nav.about, locale) },
            ]}
          />

          {bannerUrl ? (
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
              <div className="relative h-[260px] overflow-hidden bg-[#1B1931] md:h-[340px]">
                <SafeImage
                  src={bannerUrl}
                  alt=""
                  width={1400}
                  className="h-full w-full object-cover"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0A0820] via-transparent to-transparent opacity-80" />
              </div>
            </div>
          ) : null}

          {!hasContent ? (
            <EmptyState />
          ) : (
            <>
              {usePinned ? (
                <>
                  <AboutStoryPinned
                    steps={storySteps}
                    images={storyImages}
                    reducedMotion={reducedMotion}
                  />
                  <motion.section
                    className="mx-auto max-w-6xl px-4 py-10 sm:px-6"
                    initial={reducedMotion ? false : { opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.12 }}
                    transition={{ duration: 0.5, ease: easeOut }}
                  >
                    <div className="mx-auto max-w-md">
                      <ExperienceCard
                        locale={locale}
                        reducedMotion={reducedMotion}
                        isMobile={isMobile}
                      />
                    </div>
                  </motion.section>
                </>
              ) : (
                <>
                  {about ? (
                    <motion.section
                      className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20"
                      initial={reducedMotion ? false : { opacity: 0, y: 24 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.12 }}
                      transition={{ duration: 0.5, ease: easeOut }}
                    >
                      <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
                        <div className="order-2 flex flex-col gap-5 lg:order-1 lg:col-span-7">
                          <div className="flex items-center gap-2 text-white/55">
                            <span className="text-[11px] font-semibold tracking-wide text-brand-lime">
                              01
                            </span>
                            <span className="text-sm">
                              {t(UI.whoWeAre, locale)}
                            </span>
                          </div>
                          <p className="whitespace-pre-wrap text-base font-medium leading-relaxed text-white/70 md:text-lg">
                            {about}
                          </p>
                        </div>
                        <div className="order-1 lg:order-2 lg:col-span-5">
                          <ExperienceCard
                            locale={locale}
                            reducedMotion={reducedMotion}
                            isMobile={isMobile}
                          />
                        </div>
                      </div>
                    </motion.section>
                  ) : null}

                  {(vision || mission) && (
                    <section className="bg-transparent py-16 md:py-20">
                      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 sm:px-6">
                        <PillarCard
                          index={2}
                          tag={t(UI.valuesTagVision, locale)}
                          title={t(UI.ourVision, locale)}
                          body={vision}
                          reducedMotion={reducedMotion}
                        />
                        <PillarCard
                          index={3}
                          tag={t(UI.valuesTagMission, locale)}
                          title={t(UI.ourMission, locale)}
                          body={mission}
                          reducedMotion={reducedMotion}
                        />
                      </div>
                    </section>
                  )}
                </>
              )}

              {categories.length > 0 ? (
                <motion.section
                  className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20"
                  initial={reducedMotion ? false : { opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.12 }}
                  transition={{ duration: 0.5, ease: easeOut }}
                >
                  <div className="mb-6 flex items-end justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-semibold tracking-wide text-brand-lime">
                        04
                      </span>
                      <h2 className="font-display text-[22px] font-semibold text-white md:text-[30px]">
                        {t(UI.whatWeOffer, locale)}
                      </h2>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    {categories.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={
                          reducedMotion ? false : { opacity: 0, y: 16 }
                        }
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{
                          duration: 0.45,
                          delay: reducedMotion
                            ? 0
                            : Math.min(index * 0.08, 0.32),
                          ease: easeOut,
                        }}
                      >
                        <Link
                          to={`/products?section=${encodeURIComponent(item.id)}`}
                          className="group relative flex items-center justify-between bg-[#1B1931] p-6 transition-colors duration-300 hover:bg-[#292740] md:p-7"
                        >
                          <div className="flex items-center gap-4 md:gap-6">
                            <span
                              className="text-[11px] font-semibold tracking-wide text-brand-lime"
                              dir="ltr"
                            >
                              {String(index + 1).padStart(2, "0")}
                            </span>
                            <span className="font-display text-xl font-semibold text-white transition-colors group-hover:text-brand-lime md:text-[30px] md:leading-[38px]">
                              {t(item.name, locale)}
                            </span>
                          </div>
                          <span
                            className="text-[22px] text-white/45 transition-transform duration-300 group-hover:-translate-x-1 group-hover:text-brand-lime"
                            aria-hidden="true"
                          >
                            ←
                          </span>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </motion.section>
              ) : null}

              <GrowTogetherBanner />
            </>
          )}
        </main>
      ) : null}
    </>
  );
}
