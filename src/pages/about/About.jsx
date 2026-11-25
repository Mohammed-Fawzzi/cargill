import React, { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Seo from "@/components/seo/Seo";
import Loading from "@/components/loading/Loading";
import SafeImage from "@/components/ui/SafeImage";
import LogoTriangle from "@/components/ui/LogoTriangle";
import PageHero from "@/components/ui/PageHero";
import GrowTogetherBanner from "@/components/shared/GrowTogetherBanner";
import useMotionPrefs from "@/hooks/useMotionPrefs";
import useCountUp from "@/hooks/useCountUp";
import { EmptyState, ErrorState } from "@/components/ui/StatusMessage";
import { getCategories, getProducts } from "@/services/cms/products";
import { useHomepageSection } from "@/hooks/useHomepageSection";
import { categoryCoverImages, homepageSlideImages } from "@/lib/homeIntro";
import { useLocale } from "@/context/LocaleContext";
import { useSiteData } from "@/context/SiteDataContext";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";
import { easeOut } from "@/lib/motion";
import { lazyWithRetry } from "@/lib/lazyWithRetry";

const BrandTriangle3D = lazyWithRetry(() => import("@/components/ui/BrandTriangle3D"));

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

function PillarCard({ id, index, tag, title, body, reducedMotion }) {
  if (!body) return null;

  return (
    <motion.div
      id={id}
      className="page-anchor-target flex flex-col items-start justify-between gap-6 bg-[#1F1D35] p-7 transition-colors hover:bg-[#292740] lg:flex-row lg:items-center lg:p-10"
      initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 22 }}
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

const FRAME_POSITIONS = [
  "start-6 top-24",
  "end-6 top-28",
  "start-10 bottom-16",
  "end-10 bottom-20",
];

const FRAME_OFFSETS = [0, 0.04, 0.08, 0.12];

const STORY_START = { r: 10, g: 8, b: 32 };
const STORY_FALLBACK = { r: 17, g: 14, b: 51 };

function clampUnit(value) {
  return Math.min(1, Math.max(0, value));
}

function storyEase(amount) {
  const x1 = 0.22;
  const y1 = 1;
  const x2 = 0.36;
  const y2 = 1;
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;
  const sampleX = (t) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t) => ((ay * t + by) * t + cy) * t;
  const slope = (t) => (3 * ax * t + 2 * bx) * t + cx;
  if (amount <= 0) return 0;
  if (amount >= 1) return 1;
  let t = amount;
  for (let i = 0; i < 6; i += 1) {
    const dx = sampleX(t) - amount;
    const derivative = slope(t);
    if (Math.abs(dx) < 1e-4 || Math.abs(derivative) < 1e-6) break;
    t = Math.min(1, Math.max(0, t - dx / derivative));
  }
  return sampleY(t);
}

function textParts(value) {
  return String(value || "")
    .split(/(\s+)/)
    .filter((part) => part.length > 0);
}

function buildFrameStacks(pool, slideCount) {
  const safe = (pool || []).filter((item) => item?.src);
  if (!safe.length || slideCount < 1) return [[], [], [], []];
  return FRAME_OFFSETS.map((_, frame) =>
    Array.from({ length: slideCount }, (__, slide) => {
      const forward = frame % 2 === 0;
      const start = frame % safe.length;
      const step = forward ? slide : safe.length - (slide % safe.length);
      return safe[(start + step) % safe.length];
    }),
  );
}

function readOpaqueColor(node) {
  if (!node) return null;
  const value = getComputedStyle(node).backgroundColor || "";
  const parts = value.match(/[\d.]+/g);
  if (!parts || parts.length < 3) return null;
  const alpha = parts.length > 3 ? Number(parts[3]) : 1;
  if (alpha < 0.85) return null;
  return { r: Number(parts[0]), g: Number(parts[1]), b: Number(parts[2]) };
}

function nextBackground(section) {
  const sibling = readOpaqueColor(section?.nextElementSibling);
  if (sibling) return sibling;
  let parent = section?.parentElement;
  while (parent) {
    const parsed = readOpaqueColor(parent);
    if (parsed) return parsed;
    parent = parent.parentElement;
  }
  return STORY_FALLBACK;
}

function mixColor(from, to, amount) {
  const t = clampUnit(amount);
  const red = Math.round(from.r + (to.r - from.r) * t);
  const green = Math.round(from.g + (to.g - from.g) * t);
  const blue = Math.round(from.b + (to.b - from.b) * t);
  return `rgb(${red}, ${green}, ${blue})`;
}

function slideCursor(progress, count) {
  if (count <= 1) return { from: 0, fraction: 0, slideP: 0 };
  const slideP = clampUnit(progress / 0.85);
  const x = slideP * (count - 1);
  if (x >= count - 1) return { from: count - 2, fraction: 1, slideP };
  return { from: Math.floor(x), fraction: x - Math.floor(x), slideP };
}

function copyPose(index, from, fraction, count) {
  if (count <= 1) return { opacity: 1, y: 0, enter: 1 };
  const u = clampUnit((fraction - 0.22) / 0.56);
  const outT = clampUnit(u / 0.7);
  const inT = clampUnit((u - 0.3) / 0.7);
  if (index === from) {
    if (fraction >= 1) return { opacity: 0, y: -24, enter: 1 };
    if (u <= 0) return { opacity: 1, y: 0, enter: 1 };
    return { opacity: 1 - outT, y: -24 * storyEase(outT), enter: 1 };
  }
  if (index === from + 1) {
    if (inT <= 0) return { opacity: 0, y: 24, enter: 0 };
    return { opacity: inT, y: 24 * (1 - storyEase(inT)), enter: inT };
  }
  if (index < from) return { opacity: 0, y: -24, enter: 1 };
  return { opacity: 0, y: 24, enter: 0 };
}

function wordPose(enter, index, total) {
  if (enter >= 1) return { y: 0, opacity: 1 };
  if (enter <= 0) return { y: 110, opacity: 0 };
  const start = total <= 1 ? 0 : (index / total) * 0.42;
  const eased = storyEase(clampUnit((enter - start) / 0.58));
  return { y: (1 - eased) * 110, opacity: eased };
}

function pillAmount(index, from, fraction, count) {
  if (count <= 1) return index === 0 ? 1 : 0;
  const eased = storyEase(clampUnit((fraction - 0.28) / 0.44));
  if (fraction >= 1 && index === count - 1) return 1;
  if (index === from) return 1 - eased;
  if (index === from + 1) return eased;
  return 0;
}

function frameVisibility(index, rtl) {
  const onMobile = rtl ? index === 1 || index === 2 : index === 0 || index === 3;
  return onMobile ? "block" : "hidden lg:block";
}

function anchorOffset(index, count) {
  if (index <= 0 || count <= 1) return "0px";
  const progress = (index / (count - 1)) * 0.85;
  return `calc(${progress * count} * 100vh)`;
}

function AboutStoryPinned({ steps, images, rtl }) {
  const rootRef = useRef(null);
  const count = Math.max(steps.length, 1);
  const frameStacks = useMemo(
    () => buildFrameStacks(images, count),
    [images, count],
  );
  const hasFrames = frameStacks.some((stack) => stack.length > 0);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || !steps.length) return undefined;

    const sticky = root.querySelector("[data-story-sticky]");
    const stacks = [...root.querySelectorAll("[data-story-stack]")];
    const parallax = [...root.querySelectorAll("[data-story-parallax]")];
    const copies = [...root.querySelectorAll("[data-story-copy]")];
    const words = [...root.querySelectorAll("[data-story-word]")];
    const pills = [...root.querySelectorAll("[data-story-pill]")];
    const endColor = nextBackground(root);
    let current = 0;
    let snapped = false;
    let frameId = 0;

    const apply = (progress) => {
      const { from, fraction, slideP } = slideCursor(progress, count);
      stacks.forEach((stack) => {
        const frame = Number(stack.getAttribute("data-story-stack"));
        const offset = FRAME_OFFSETS[frame] || 0;
        const frameP = clampUnit((slideP - offset) / (1 - offset || 1));
        const shift = frameP * Math.max(count - 1, 0);
        stack.style.transform = `translate3d(0, ${(-shift * 100) / count}%, 0)`;
      });
      parallax.forEach((layer) => {
        const frame = Number(layer.getAttribute("data-frame"));
        const slide = Number(layer.getAttribute("data-slide"));
        const offset = FRAME_OFFSETS[frame] || 0;
        const frameP = clampUnit((slideP - offset) / (1 - offset || 1));
        const shift = frameP * Math.max(count - 1, 0);
        const local = shift - slide;
        layer.style.transform = `translate3d(0, ${local * 8}%, 0)`;
      });
      copies.forEach((copy) => {
        const index = Number(copy.getAttribute("data-story-copy"));
        const pose = copyPose(index, from, fraction, count);
        copy.style.opacity = String(pose.opacity);
        copy.style.transform = `translate3d(0, ${pose.y}px, 0)`;
        copy.style.pointerEvents = pose.opacity > 0.45 ? "auto" : "none";
        copy.style.zIndex = pose.opacity > 0.45 ? "2" : "1";
        if (pose.opacity > 0.2) copy.removeAttribute("aria-hidden");
        else copy.setAttribute("aria-hidden", "true");
      });
      words.forEach((word) => {
        const copyIndex = Number(word.getAttribute("data-copy"));
        const wordIndex = Number(word.getAttribute("data-word"));
        const total = Number(word.getAttribute("data-words"));
        const pose = copyPose(copyIndex, from, fraction, count);
        const reveal = wordPose(pose.enter, wordIndex, total);
        word.style.transform = `translate3d(0, ${reveal.y}%, 0)`;
        word.style.opacity = String(reveal.opacity);
      });
      pills.forEach((pill) => {
        const index = Number(pill.getAttribute("data-story-pill"));
        const amount = pillAmount(index, from, fraction, count);
        const red = Math.round(255 + (140 - 255) * amount);
        const green = Math.round(255 + (198 - 255) * amount);
        const blue = Math.round(255 + (63 - 255) * amount);
        const alpha = 0.25 + amount * 0.75;
        pill.style.width = `${6 + amount * 22}px`;
        pill.style.backgroundColor = `rgba(${red}, ${green}, ${blue}, ${alpha})`;
      });
      if (sticky) {
        const exit = storyEase(clampUnit((progress - 0.85) / 0.15));
        sticky.style.backgroundColor = mixColor(STORY_START, endColor, exit);
      }
    };

    const tick = () => {
      const height = sticky?.offsetHeight || window.innerHeight;
      const travel = Math.max(1, root.offsetHeight - height);
      const target = Math.min(travel, Math.max(0, -root.getBoundingClientRect().top)) / travel;
      if (!snapped) {
        current = target;
        snapped = true;
      } else {
        current += (target - current) * 0.12;
        if (Math.abs(target - current) < 0.0004) current = target;
      }
      apply(current);
      frameId = requestAnimationFrame(tick);
    };

    tick();
    return () => cancelAnimationFrame(frameId);
  }, [steps, count, images]);

  return (
    <section
      ref={rootRef}
      className="page-anchor-target relative bg-[#0A0820]"
      style={{ height: `calc(${count * 100}vh + 100svh)` }}
    >
      {steps.map((step, index) => (
        <div
          key={step.id}
          id={`about-${step.id}`}
          className="page-anchor-target absolute inset-x-0"
          style={{ top: anchorOffset(index, count), height: "100vh" }}
        />
      ))}
      <div
        data-story-sticky=""
        className="sticky top-0 flex h-[100svh] items-center overflow-hidden bg-[#0A0820]"
      >
        {hasFrames ? (
          <div className="pointer-events-none absolute inset-0">
            {frameStacks.map((stack, index) => (
              <div
                key={`frame-${index}`}
                className={`absolute h-36 w-28 overflow-hidden rounded-2xl border border-white/10 xl:h-44 xl:w-36 ${FRAME_POSITIONS[index]} ${frameVisibility(index, rtl)}`}
              >
                <div
                  data-story-stack={index}
                  className="absolute inset-x-0 top-0 w-full"
                  style={{ height: `${count * 100}%` }}
                >
                  {stack.map((image, slide) => (
                    <div
                      key={`${index}-${slide}-${image.src}`}
                      className="relative w-full overflow-hidden"
                      style={{
                        height: `calc(100% / ${count} + 1px)`,
                        marginTop: slide > 0 ? "-1px" : undefined,
                      }}
                    >
                      <div
                        data-story-parallax=""
                        data-frame={index}
                        data-slide={slide}
                        className="absolute inset-0"
                      >
                        <SafeImage
                          src={image.src}
                          alt={image.alt || ""}
                          width={640}
                          loading="eager"
                          className="absolute left-0 w-full object-cover"
                          style={{ height: "120%", top: "-10%" }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : null}

        <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center px-4 sm:px-6">
          <div className="grid w-full">
            {steps.map((step, index) => {
              const parts = textParts(step.title);
              const wordTotal = parts.filter((part) => part.trim()).length;
              let wordIndex = 0;
              return (
                <div
                  key={step.id}
                  data-story-copy={index}
                  className="col-start-1 row-start-1 mx-auto w-full max-w-2xl select-text text-center"
                  style={{
                    opacity: index === 0 ? 1 : 0,
                    transform: "translate3d(0, 0px, 0)",
                  }}
                  aria-hidden={index === 0 ? undefined : true}
                >
                  {step.label ? (
                    <p className="mb-3 text-xs font-medium tracking-wide text-brand-lime">
                      {step.label}
                    </p>
                  ) : null}
                  {step.title ? (
                    <h2 className="mb-5 font-display text-3xl font-bold text-white md:text-4xl">
                      {parts.map((part, partIndex) => {
                        if (!part.trim()) {
                          return <span key={`s-${partIndex}`}>{part}</span>;
                        }
                        const current = wordIndex;
                        wordIndex += 1;
                        return (
                          <span
                            key={`w-${partIndex}`}
                            className="inline-block overflow-hidden px-[0.08em] py-[0.42em] -mx-[0.08em] -my-[0.42em] align-bottom"
                          >
                            <span
                              data-story-word=""
                              data-copy={index}
                              data-word={current}
                              data-words={wordTotal}
                              className="inline-block"
                            >
                              {part}
                            </span>
                          </span>
                        );
                      })}
                    </h2>
                  ) : null}
                  <p className="whitespace-pre-wrap text-base leading-relaxed text-white/75 md:text-lg">
                    {step.body}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-10 flex items-center gap-2" aria-hidden="true">
            {steps.map((step, index) => (
              <span
                key={step.id}
                data-story-pill={index}
                className="h-1.5 rounded-full"
                style={{
                  width: index === 0 ? 28 : 6,
                  backgroundColor: index === 0 ? "#8CC63F" : "#ffffff",
                  opacity: index === 0 ? 1 : 0.25,
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

  const heroQuery = useHomepageSection("hero");
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

  const storyMedia = useMemo(() => {
    const products = productsQuery.data || [];
    const items = [];
    if (bannerUrl) {
      items.push({ src: bannerUrl, alt: titleText || "" });
    }
    categories.forEach((category) => {
      const src =
        category.imageUrl ||
        products.find(
          (product) => product.sectionId === category.id && product.imageUrl,
        )?.imageUrl ||
        "";
      if (!src) return;
      items.push({ src, alt: t(category.name, locale) || "" });
    });
    return items.slice(0, 8);
  }, [bannerUrl, categories, productsQuery.data, titleText, locale]);

  const storyImages = useMemo(
    () => storyMedia.map((item) => item.src),
    [storyMedia],
  );

  const hasContent = Boolean(about || vision || mission || categories.length);
  const usePinned = !reducedMotion && storySteps.length > 1;
  const heroSlides = useMemo(
    () => homepageSlideImages(heroQuery.data),
    [heroQuery.data],
  );
  const aboutImage = heroSlides[0] || bannerUrl || "";
  const heroSides = useMemo(() => {
    const covers = categoryCoverImages(categories, productsQuery.data || []);
    return [...heroSlides.slice(1), bannerUrl, ...storyImages, ...covers].filter(
      (src, index, list) => src && src !== aboutImage && list.indexOf(src) === index,
    );
  }, [heroSlides, bannerUrl, storyImages, categories, productsQuery.data, aboutImage]);

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
          <PageHero
            title={titleText}
            description={about}
            imageUrl={aboutImage}
            sideImages={heroSides}
            crumbs={[
              { label: t(UI.nav.home, locale), to: "/" },
              { label: t(UI.nav.about, locale) },
            ]}
            anchors={[
              about ? { id: "about-about", label: t(UI.whoWeAre, locale) } : null,
              vision ? { id: "about-vision", label: t(UI.ourVision, locale) } : null,
              mission ? { id: "about-mission", label: t(UI.ourMission, locale) } : null,
              categories.length
                ? { id: "about-offer", label: t(UI.whatWeOffer, locale) }
                : null,
            ].filter(Boolean)}
          />

          {!hasContent ? (
            <EmptyState />
          ) : (
            <>
              {usePinned ? (
                <>
                  <AboutStoryPinned
                    steps={storySteps}
                    images={storyMedia}
                    rtl={locale === "ar"}
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
                      id="about-about"
                      className="page-anchor-target mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20"
                      initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
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
                          id="about-vision"
                          index={2}
                          tag={t(UI.valuesTagVision, locale)}
                          title={t(UI.ourVision, locale)}
                          body={vision}
                          reducedMotion={reducedMotion}
                        />
                        <PillarCard
                          id="about-mission"
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
                  id="about-offer"
                  className="page-anchor-target mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20"
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
