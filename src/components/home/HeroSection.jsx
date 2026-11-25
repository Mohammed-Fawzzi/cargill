import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import SafeImage from "@/components/ui/SafeImage";
import AccentHeading from "@/components/ui/AccentHeading";
import CategoryStrip from "@/components/home/CategoryStrip";
import { useLocale } from "@/context/LocaleContext";
import { useSiteData } from "@/context/SiteDataContext";
import { toWhatsAppHref } from "@/lib/phone";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";
import { easeOut } from "@/lib/motion";
import useMotionPrefs from "@/hooks/useMotionPrefs";

const SPROUT = [0.22, 1, 0.36, 1];
const INTRO_EASE = [0.76, 0, 0.24, 1];

function HeadlineReveal({ text, reducedMotion, active }) {
  const lines = useMemo(() => {
    const raw = String(text || "").trim();
    if (!raw) return [];
    const parts = raw.split(/\n+/).map((line) => line.trim()).filter(Boolean);
    return parts.length ? parts : [raw];
  }, [text]);

  if (!lines.length) return null;

  return (
    <h1 className="mt-4 max-w-[18ch] break-words font-display text-[clamp(2.5rem,6.5vw,4.75rem)] font-black leading-[1.12] text-white sm:mt-[18px] md:max-w-[980px]">
      {lines.map((line, index) => (
        <span key={index} className="block overflow-hidden px-[0.04em] py-[0.1em]">
          <motion.span
            className="block"
            initial={reducedMotion || !active ? false : { y: "110%" }}
            animate={active ? { y: "0%" } : { y: reducedMotion ? "0%" : "110%" }}
            transition={{
              duration: 0.7,
              delay: reducedMotion || !active ? 0 : 0.28 + index * 0.12,
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

export default function HeroSection({ section, entranceReady = true }) {
  const { locale } = useLocale();
  const { contact } = useSiteData();
  const { reducedMotion } = useMotionPrefs();
  const [slide, setSlide] = useState(0);
  const [ready, setReady] = useState(false);
  const [entered, setEntered] = useState(Boolean(entranceReady));

  const slides = useMemo(() => section?.data?.slides || [], [section?.data?.slides]);
  const images = useMemo(
    () => slides.map((item) => item?.imageUrl).filter(Boolean).slice(0, 3),
    [slides],
  );
  const headlineSlide = slides.find((item) => t(item?.title, locale)) || slides[0];
  const title = t(headlineSlide?.title, locale);
  const body = t(headlineSlide?.body, locale);
  const phone = contact?.phones?.[0] || "";
  const waHref = toWhatsAppHref(phone, t(UI.askAgronomistMessage, locale));

  useEffect(() => {
    if (entranceReady) setEntered(true);
  }, [entranceReady]);

  useEffect(() => {
    if (!entered || reducedMotion || images.length < 2) return undefined;
    const timer = window.setInterval(() => {
      setSlide((current) => (current + 1) % images.length);
    }, 5200);
    return () => window.clearInterval(timer);
  }, [images.length, reducedMotion, entered]);

  useEffect(() => {
    if (!entered) {
      setReady(false);
      return undefined;
    }
    const timer = window.setTimeout(
      () => setReady(true),
      reducedMotion ? 0 : 900,
    );
    return () => window.clearTimeout(timer);
  }, [reducedMotion, entered]);

  if (!title && !body && !images.length) return null;

  const delay = reducedMotion || !entered ? 0 : 0.12;
  const showMotion = entered && !reducedMotion;

  return (
    <>
      <section className="relative isolate bg-[#0A0820]">
        <div
          data-home-hero-media
          className="absolute inset-0 overflow-hidden"
        >
          <AnimatePresence mode="sync" initial={false}>
            {images.length ? (
              <motion.div
                key={images[slide] || "hero"}
                className="absolute inset-0 overflow-hidden"
                initial={showMotion ? { opacity: 0 } : false}
                animate={{ opacity: 1 }}
                exit={showMotion ? { opacity: 0 } : undefined}
                transition={{
                  duration: showMotion ? 0.9 : 0,
                  ease: easeOut,
                }}
              >
                <motion.div
                  className="absolute inset-0 origin-center will-change-transform backface-hidden"
                  initial={
                    entered && !reducedMotion
                      ? { scale: 1 }
                      : false
                  }
                  animate={{
                    scale: entered && !reducedMotion ? 1.06 : 1,
                  }}
                  transition={{
                    duration: entered && !reducedMotion ? 5.6 : 0,
                    ease: [0.25, 0.1, 0.25, 1],
                  }}
                >
                  <SafeImage
                    src={images[slide]}
                    alt=""
                    width={1920}
                    loading="eager"
                    fetchPriority="high"
                    className="h-full w-full object-cover object-center"
                    aria-hidden="true"
                  />
                </motion.div>
              </motion.div>
            ) : (
              <div className="absolute inset-0 bg-[#0A0820]" />
            )}
          </AnimatePresence>
          <motion.div
            className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,8,32,0.92)_0%,rgba(10,8,32,0.4)_55%,rgba(10,8,32,0.15)_100%)]"
            aria-hidden="true"
            initial={false}
            animate={{ opacity: entered ? 1 : 0 }}
            transition={{ duration: 0.45, ease: INTRO_EASE }}
          />
          <motion.div
            className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,8,32,0.25)_0%,transparent_28%,transparent_50%,#0A0820_100%)]"
            aria-hidden="true"
            initial={false}
            animate={{ opacity: entered ? 1 : 0 }}
            transition={{ duration: 0.45, ease: INTRO_EASE }}
          />
        </div>

        <div className="relative z-30 mx-auto flex min-h-[min(860px,100svh)] max-w-[1320px] flex-col px-6 pb-[170px] pt-[calc(var(--navbar-height)+var(--ticker-height)+2.75rem)] md:pb-[200px] md:pt-[calc(var(--navbar-height)+var(--ticker-height)+3.25rem)]">
          <motion.p
            className="shrink-0 font-mono text-[13px] tracking-[3px] text-brand-lime"
            dir="ltr"
            initial={false}
            animate={
              entered
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: 12 }
            }
            transition={{ duration: 0.45, delay, ease: SPROUT }}
          >
            § 01 — FIELD PROFILE · ALEXANDRIA, EGYPT
          </motion.p>

          {title ? (
            <HeadlineReveal
              text={title}
              reducedMotion={reducedMotion}
              active={entered}
            />
          ) : null}

          {body ? (
            <motion.p
              className="mt-5 max-w-[34rem] text-[16px] leading-[1.7] text-white/78 sm:mt-6 sm:text-[19px] md:text-[21px]"
              initial={false}
              animate={
                entered
                  ? { opacity: 1, y: 0 }
                  : { opacity: 0, y: 14 }
              }
              transition={{
                duration: 0.45,
                delay: delay + 0.28,
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
              entered
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: 14 }
            }
            transition={{
              duration: 0.45,
              delay: delay + 0.38,
              ease: easeOut,
            }}
          >
            <Link
              to="/products"
              className="inline-flex items-center rounded-lg bg-brand-lime px-[30px] py-[17px] text-[17px] font-semibold text-[#0A0820] transition-colors hover:bg-brand-lime-hover"
            >
              {t(UI.browseProducts, locale)} ←
            </Link>
            {waHref ? (
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-lg border border-white/28 px-[30px] py-[17px] text-[17px] text-white transition-colors hover:border-brand-lime hover:text-brand-lime"
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
