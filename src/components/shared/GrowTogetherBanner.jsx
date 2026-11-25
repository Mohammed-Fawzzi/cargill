import React, { lazy, Suspense, useRef } from "react";
import { motion, useInView } from "framer-motion";
import LogoTriangle from "@/components/ui/LogoTriangle";
import AccentHeading from "@/components/ui/AccentHeading";
import SplitArrowButton from "@/components/ui/SplitArrowButton";
import { useLocale } from "@/context/LocaleContext";
import { useSiteData } from "@/context/SiteDataContext";
import { toTelHref, toWhatsAppHref } from "@/lib/phone";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";
import { easeOut } from "@/lib/motion";
import useMotionPrefs from "@/hooks/useMotionPrefs";

const BrandTriangle3D = lazy(() => import("@/components/ui/BrandTriangle3D"));

export default function GrowTogetherBanner() {
  const { locale } = useLocale();
  const { contact } = useSiteData();
  const { reducedMotion } = useMotionPrefs();
  const phone = contact?.phones?.[0] || "";
  const phoneHref = toTelHref(phone);
  const waHref = toWhatsAppHref(phone, t(UI.askAgronomistMessage, locale));
  const title = t(UI.growTogetherTitle, locale);
  const body = t(UI.growTogetherBody, locale);
  const headingRef = useRef(null);
  const inView = useInView(headingRef, { once: true, amount: 0.45 });

  return (
    <motion.section
      className="bg-transparent py-14 md:py-16"
      initial={reducedMotion ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.5, ease: easeOut }}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-white/8 bg-gradient-to-l from-[#110E33] to-[#181347] p-8 md:p-14">
          <div className="pointer-events-none absolute -end-20 -top-20 h-96 w-96 opacity-10">
            {reducedMotion ? (
              <LogoTriangle className="h-full w-full" />
            ) : (
              <Suspense fallback={<LogoTriangle className="h-full w-full" />}>
                <BrandTriangle3D
                  className="h-full w-full"
                  softLight
                  spin={0.14}
                  followMouse={false}
                />
              </Suspense>
            )}
          </div>

          <div className="relative z-10 grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-8">
              <p className="text-xs font-medium tracking-wide text-brand-lime">
                {t(UI.growTogetherEyebrow, locale)}
              </p>

              <div ref={headingRef} className="overflow-hidden py-[0.08em]">
                <motion.div
                  initial={reducedMotion ? false : { y: "110%" }}
                  animate={
                    inView || reducedMotion ? { y: "0%" } : { y: "110%" }
                  }
                  transition={{ duration: 0.7, ease: easeOut }}
                >
                  <AccentHeading
                    as="h2"
                    text={title}
                    className="font-display text-3xl font-bold text-white md:text-5xl"
                  />
                </motion.div>
              </div>

              {body ? (
                <p className="max-w-xl text-base leading-relaxed text-white/60">
                  {body}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:col-span-4 lg:flex-col lg:justify-end">
              {phoneHref ? (
                <SplitArrowButton href={phoneHref} variant="primary">
                  <span dir="ltr">{phone}</span>
                </SplitArrowButton>
              ) : null}
              {waHref ? (
                <SplitArrowButton href={waHref} variant="secondary">
                  {t(UI.requestFarmVisit, locale)}
                </SplitArrowButton>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
