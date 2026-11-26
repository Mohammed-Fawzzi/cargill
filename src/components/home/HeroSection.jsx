import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import SafeImage from "@/components/ui/SafeImage";
import AccentHeading from "@/components/ui/AccentHeading";
import CategoryStrip from "@/components/home/CategoryStrip";
import HeroMedia from "@/components/ui/HeroMedia";
import { useLocale } from "@/context/LocaleContext";
import { useSiteData } from "@/context/SiteDataContext";
import { HERO_VIDEO_URL } from "@/config/media";
import { toWhatsAppHref } from "@/lib/phone";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";
import { easeOut } from "@/lib/motion";
import { shouldPlayHeroVideo, warnMissingMedia } from "@/lib/image";
import useMotionPrefs from "@/hooks/useMotionPrefs";

const SPROUT = [0.22, 1, 0.36, 1];
const INTRO_EASE = [0.76, 0, 0.24, 1];
const IMAGE_HOLD_MS = 5200;
const VIDEO_COPY_WAIT_MS = 5000;

function HeadlineReveal({ text, reducedMotion, active }) {
  const lines = useMemo(() => {
    const raw = String(text || "").trim();
    if (!raw) return [];
    const parts = raw.split(/\n+/).map((line) => line.trim()).filter(Boolean);
    return parts.length ? parts : [raw];
  }, [text]);

  if (!lines.length) return null;

  return (
    <h1 className="mt-4 max-w-[18ch] break-words font-display text-[clamp(2.15rem,8vw,4.75rem)] font-black leading-[1.35] text-white sm:mt-[18px] md:max-w-[980px] md:text-[clamp(2.5rem,6.5vw,4.75rem)] md:leading-[1.15]">
      {lines.map((line, index) => (
        <span key={index} className="block overflow-hidden px-[0.04em] py-[0.1em]">
          <motion.span
            className="block"
            initial={reducedMotion || !active ? false : { y: "110%" }}
            animate={active ? { y: "0%" } : { y: reducedMotion ? "0%" : "110%" }}
            transition={{
              duration: 0.55,
              delay: reducedMotion || !active ? 0 : 0.04 + index * 0.08,
              ease: SPROUT,
            }}
          >
            {index === lines.length - 1 ? (
              <AccentHeading as="span" text={line} />
            ) : (
              line
            )}
          </motion.span>
        </span>
      ))}
    </h1>
  );
}

function HeroPoster({ src, animate, entered, reducedMotion }) {
  if (!src) return <div className="absolute inset-0 bg-[#0A0820]" />;
  return (
    <motion.div
      className="absolute inset-0 origin-center will-change-transform backface-hidden"
      initial={animate && entered && !reducedMotion ? { scale: 1 } : false}
      animate={{ scale: animate && entered && !reducedMotion ? 1.06 : 1 }}
      transition={{
        duration: animate && entered && !reducedMotion ? 5.6 : 0,
        ease: [0.25, 0.1, 0.25, 1],
      }}
    >
      <SafeImage
        src={src}
        alt=""
        width={1920}
        loading="eager"
        fetchPriority="high"
        className="h-full w-full object-cover object-center"
        aria-hidden="true"
      />
    </motion.div>
  );
}

export default function HeroSection({ section, entranceReady = true }) {
  const { locale } = useLocale();
  const { contact } = useSiteData();
  const { reducedMotion } = useMotionPrefs();
  const [slide, setSlide] = useState(0);
  const [ready, setReady] = useState(false);
  const [entered, setEntered] = useState(Boolean(entranceReady));
  const [copyReady, setCopyReady] = useState(false);
  const [media, setMedia] = useState({
    want: false,
    visible: false,
    failed: false,
    finished: false,
    index: 0,
    src: "",
    raw: "",
  });

  const slides = useMemo(() => section?.data?.slides || [], [section?.data?.slides]);
  const images = useMemo(
    () => slides.map((item) => item?.imageUrl).filter(Boolean),
    [slides],
  );
  const videoItems = useMemo(() => {
    const fromSlides = slides
      .map((item, index) => {
        const videoUrl =
          typeof item?.videoUrl === "string" ? item.videoUrl.trim() : "";
        if (!videoUrl) return null;
        const imageUrl =
          typeof item?.imageUrl === "string" ? item.imageUrl.trim() : "";
        return { videoUrl, imageUrl, index };
      })
      .filter(Boolean);
    if (fromSlides.length) return fromSlides;
    const fromSection =
      typeof section?.data?.videoUrl === "string"
        ? section.data.videoUrl.trim()
        : "";
    if (fromSection) {
      return [
        {
          videoUrl: fromSection,
          imageUrl: section?.data?.imageUrl || "",
          index: -1,
        },
      ];
    }
    if (HERO_VIDEO_URL) {
      return [{ videoUrl: HERO_VIDEO_URL, imageUrl: "", index: -1 }];
    }
    return [];
  }, [slides, section?.data?.videoUrl, section?.data?.imageUrl]);
  const videoUrls = useMemo(
    () => videoItems.map((item) => item.videoUrl),
    [videoItems],
  );
  const poster = useMemo(() => {
    const current = videoItems[media.index || 0];
    return (
      current?.imageUrl ||
      images[0] ||
      section?.data?.imageUrl ||
      ""
    );
  }, [videoItems, media.index, images, section?.data?.imageUrl]);
  const headlineSlide = slides.find((item) => t(item?.title, locale)) || slides[0];
  const title = t(headlineSlide?.title, locale);
  const body = t(headlineSlide?.body, locale);
  const phone = contact?.phones?.[0] || "";
  const waHref = toWhatsAppHref(phone, t(UI.askAgronomistMessage, locale));
  const wantVideo = Boolean(media.want || media.visible);
  const useSlideshow = !wantVideo && images.length > 0;
  const showCopy = entered && copyReady;

  useEffect(() => {
    if (entranceReady) setEntered(true);
  }, [entranceReady]);

  useEffect(() => {
    warnMissingMedia("homepage/hero.images", images[0] || section?.data?.imageUrl);
  }, [images, section?.data?.imageUrl]);

  useEffect(() => {
    if (!videoUrls.length || reducedMotion || !shouldPlayHeroVideo()) {
      setCopyReady(true);
      return undefined;
    }
    if (media.visible || media.failed || media.finished) {
      setCopyReady(true);
      return undefined;
    }
    setCopyReady(false);
    const timer = window.setTimeout(() => setCopyReady(true), VIDEO_COPY_WAIT_MS);
    return () => window.clearTimeout(timer);
  }, [
    videoUrls.length,
    reducedMotion,
    media.visible,
    media.failed,
    media.finished,
  ]);

  useEffect(() => {
    if (!entered || reducedMotion || wantVideo || images.length < 2) {
      return undefined;
    }
    const timer = window.setInterval(() => {
      setSlide((current) => (current + 1) % images.length);
    }, IMAGE_HOLD_MS);
    return () => window.clearInterval(timer);
  }, [images.length, reducedMotion, entered, wantVideo]);

  useEffect(() => {
    if (!showCopy) {
      setReady(false);
      return undefined;
    }
    const timer = window.setTimeout(
      () => setReady(true),
      reducedMotion ? 0 : 900,
    );
    return () => window.clearTimeout(timer);
  }, [reducedMotion, showCopy]);

  if (!title && !body && !images.length && !videoUrls.length) return null;

  const delay = reducedMotion || !showCopy ? 0 : 0.05;
  const showMotion = showCopy && !reducedMotion;
  const slideSrc = images[slide] || poster;

  return (
    <>
      <section data-home-bg="#0A0820" className="relative isolate bg-transparent">
        <div
          data-home-hero-media
          className="absolute inset-0 overflow-hidden"
        >
          {wantVideo ? (
            <div className="absolute inset-0 overflow-hidden">
              <HeroPoster
                src={poster || slideSrc}
                animate={false}
                entered={entered}
                reducedMotion={reducedMotion}
              />
            </div>
          ) : (
            <AnimatePresence mode="sync" initial={false}>
              {useSlideshow ? (
                <motion.div
                  key={slideSrc || "hero"}
                  className="absolute inset-0 overflow-hidden"
                  initial={showMotion ? { opacity: 0 } : false}
                  animate={{ opacity: 1 }}
                  exit={showMotion ? { opacity: 0 } : undefined}
                  transition={{
                    duration: showMotion ? 0.9 : 0,
                    ease: easeOut,
                  }}
                >
                  <HeroPoster
                    src={slideSrc}
                    animate
                    entered={entered}
                    reducedMotion={reducedMotion}
                  />
                </motion.div>
              ) : poster ? (
                <div className="absolute inset-0 overflow-hidden">
                  <HeroPoster
                    src={poster}
                    animate
                    entered={entered}
                    reducedMotion={reducedMotion}
                  />
                </div>
              ) : (
                <div className="absolute inset-0 bg-[#0A0820]" />
              )}
            </AnimatePresence>
          )}
          <HeroMedia
            videoUrls={videoUrls}
            posterUrl={poster}
            ready={Boolean(videoUrls.length)}
            slot="home"
            onStateChange={setMedia}
          />
          <motion.div
            className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,8,32,0.92)_0%,rgba(10,8,32,0.4)_55%,rgba(10,8,32,0.15)_100%)]"
            aria-hidden="true"
            initial={false}
            animate={{ opacity: showCopy ? 1 : 0 }}
            transition={{ duration: 0.35, ease: INTRO_EASE }}
          />
          <motion.div
            className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,8,32,0.25)_0%,transparent_28%,transparent_50%,#0A0820_100%)]"
            aria-hidden="true"
            initial={false}
            animate={{ opacity: showCopy ? 1 : 0 }}
            transition={{ duration: 0.35, ease: INTRO_EASE }}
          />
        </div>

        <div className="relative z-30 mx-auto flex min-h-[min(860px,100svh)] max-w-[1320px] flex-col px-4 pb-[170px] pt-[calc(var(--navbar-height)+var(--ticker-height)+2.75rem)] sm:px-6 md:pb-[200px] md:pt-[calc(var(--navbar-height)+var(--ticker-height)+3.25rem)]">
          <motion.p
            className="max-w-full break-words font-mono text-[12px] tracking-[0.16em] text-brand-lime sm:text-[13px] sm:tracking-[3px]"
            dir="ltr"
            initial={false}
            animate={
              showCopy
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: 12 }
            }
            transition={{ duration: 0.4, delay, ease: SPROUT }}
          >
            § 01 — FIELD PROFILE · ALEXANDRIA, EGYPT
          </motion.p>

          {title ? (
            <HeadlineReveal
              text={title}
              reducedMotion={reducedMotion}
              active={showCopy}
            />
          ) : null}

          {body ? (
            <motion.p
              className="mt-5 max-w-[34rem] text-[16px] leading-[1.7] text-white/78 sm:mt-6 sm:text-[19px] md:text-[21px]"
              initial={false}
              animate={
                showCopy
                  ? { opacity: 1, y: 0 }
                  : { opacity: 0, y: 14 }
              }
              transition={{
                duration: 0.4,
                delay: delay + 0.12,
                ease: easeOut,
              }}
            >
              {body}
            </motion.p>
          ) : null}

          <motion.div
            className="mt-7 flex flex-wrap gap-3.5 sm:mt-8"
            initial={false}
            animate={
              showCopy
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: 14 }
            }
            transition={{
              duration: 0.4,
              delay: delay + 0.18,
              ease: easeOut,
            }}
          >
            <Link
              to="/products"
              className="inline-flex max-w-full items-center justify-center rounded-lg bg-brand-lime px-5 py-3.5 text-center text-base font-semibold text-[#0A0820] transition-colors hover:bg-brand-lime-hover sm:px-[30px] sm:py-[17px] sm:text-[17px]"
            >
              {t(UI.browseProducts, locale)} ←
            </Link>
            {waHref ? (
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex max-w-full items-center justify-center rounded-lg border border-white/28 px-5 py-3.5 text-center text-base text-white transition-colors hover:border-brand-lime hover:text-brand-lime sm:px-[30px] sm:py-[17px] sm:text-[17px]"
              >
                {t(UI.askAgronomist, locale)}
              </a>
            ) : null}
          </motion.div>
        </div>
      </section>

      <CategoryStrip ready={ready} />
    </>
  );
}
