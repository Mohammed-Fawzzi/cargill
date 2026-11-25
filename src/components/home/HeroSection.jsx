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

function HeadlineReveal({ text, reducedMotion }) {
  const lines = useMemo(() => {
    const raw = String(text || "").trim();
    if (!raw) return [];
    const parts = raw.split(/\n+/).map((line) => line.trim()).filter(Boolean);
    return parts.length ? parts : [raw];
  }, [text]);

  if (!lines.length) return null;

  return (
    <h1 className="mt-4 max-w-[18ch] font-display text-[clamp(2.5rem,6.5vw,4.75rem)] font-black leading-[1.05] tracking-[-0.03em] text-white sm:mt-[18px] md:max-w-[980px]">
      {lines.map((line, index) => (
        <span key={index} className="block overflow-hidden py-[0.06em]">
          <motion.span
            className="block"
            initial={reducedMotion ? false : { y: "110%" }}
            animate={{ y: "0%" }}
            transition={{
              duration: 0.7,
              delay: reducedMotion ? 0 : 0.28 + index * 0.12,
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

export default function HeroSection({ section }) {
  const { locale } = useLocale();
  const { contact } = useSiteData();
  const { reducedMotion } = useMotionPrefs();
  const [slide, setSlide] = useState(0);
  const [ready, setReady] = useState(false);

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
    if (reducedMotion || images.length < 2) return undefined;
    const timer = window.setInterval(() => {
      setSlide((current) => (current + 1) % images.length);
    }, 5200);
    return () => window.clearInterval(timer);
  }, [images.length, reducedMotion]);

  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), reducedMotion ? 0 : 900);
    return () => window.clearTimeout(timer);
  }, [reducedMotion]);

  if (!title && !body && !images.length) return null;

  const delay = reducedMotion ? 0 : 0.2;

  return (
    <>
      <section className="relative isolate bg-[#0A0820]">
        <div className="absolute inset-0 overflow-hidden">
          <AnimatePresence mode="sync" initial={false}>
            {images.length ? (
              <motion.div
                key={images[slide] || "hero"}
                className="absolute inset-0 overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reducedMotion ? 0 : 0.9, ease: "easeInOut" }}
              >
                <motion.div
                  className="absolute inset-[-4%] h-[108%] w-[108%]"
                  initial={reducedMotion ? false : { scale: 1 }}
                  animate={reducedMotion ? { scale: 1 } : { scale: 1.08 }}
                  transition={{
                    duration: reducedMotion ? 0 : 14,
                    ease: "linear",
                  }}
                >
                  <SafeImage
                    src={images[slide]}
                    alt=""
                    width={1600}
                    loading="eager"
                    fetchPriority="high"
                    className="h-full w-full object-cover"
                    aria-hidden="true"
                  />
                </motion.div>
              </motion.div>
            ) : (
              <div className="absolute inset-0 bg-[#0A0820]" />
            )}
          </AnimatePresence>
          <div
            className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,8,32,0.92)_0%,rgba(10,8,32,0.4)_55%,rgba(10,8,32,0.15)_100%)]"
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,8,32,0.25)_0%,transparent_28%,transparent_50%,#0A0820_100%)]"
            aria-hidden="true"
          />
        </div>

        <div className="relative z-30 mx-auto flex min-h-[min(860px,100svh)] max-w-[1320px] flex-col px-6 pb-[170px] pt-[calc(var(--navbar-height)+var(--ticker-height)+2.75rem)] md:pb-[200px] md:pt-[calc(var(--navbar-height)+var(--ticker-height)+3.25rem)]">
          <motion.p
            className="shrink-0 font-mono text-[13px] tracking-[3px] text-brand-lime"
            dir="ltr"
            initial={reducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay, ease: SPROUT }}
          >
            § 01 — FIELD PROFILE · ALEXANDRIA, EGYPT
          </motion.p>

          {title ? <HeadlineReveal text={title} reducedMotion={reducedMotion} /> : null}

          {body ? (
            <motion.p
              className="mt-5 max-w-[34rem] text-[16px] leading-[1.7] text-white/78 sm:mt-6 sm:text-[19px] md:text-[21px]"
              initial={reducedMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: delay + 0.28, ease: easeOut }}
            >
              {body}
            </motion.p>
          ) : null}

          <motion.div
            className="mt-7 flex flex-wrap gap-3.5 sm:mt-8"
            initial={reducedMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: delay + 0.38, ease: easeOut }}
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
