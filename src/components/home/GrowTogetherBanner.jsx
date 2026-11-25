import React, { lazy, Suspense } from "react";
import { motion } from "framer-motion";
import LogoTriangle from "@/components/ui/LogoTriangle";
import AccentHeading from "@/components/ui/AccentHeading";
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

  return (
    <motion.section
      className="relative overflow-hidden rounded-t-[28px] bg-[#181060] py-[110px] pt-[120px]"
      initial={reducedMotion ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.5, ease: easeOut }}
    >
      <div className="pointer-events-none absolute -bottom-[80px] -start-[40px] z-0 h-[min(420px,55vw)] w-[min(520px,70vw)]">
        {reducedMotion ? (
          <LogoTriangle className="h-full w-full opacity-95" />
        ) : (
          <Suspense fallback={<LogoTriangle className="h-full w-full opacity-95" />}>
            <BrandTriangle3D
              className="h-full w-full"
              softLight
              spin={0.14}
              followMouse={false}
            />
          </Suspense>
        )}
      </div>

      <div className="relative z-10 mx-auto max-w-[1320px] px-6">
        <p
          className="font-mono text-[13px] tracking-[3px] text-brand-lime"
          dir="ltr"
        >
          § 05 — LET&apos;S GROW
        </p>

        <AccentHeading
          as="h2"
          text={title}
          className="mt-[22px] font-display text-[clamp(3.5rem,12vw,9.375rem)] font-black leading-none tracking-[-0.03em] text-white max-md:text-[64px]"
        />

        <div className="mt-12 flex flex-wrap items-center gap-4">
          {waHref ? (
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-brand-lime px-8 py-[18px] text-[18px] font-semibold text-[#0A0820] transition-colors hover:bg-brand-lime-hover"
            >
              {t(UI.askAgronomist, locale)}
            </a>
          ) : null}
          {phoneHref ? (
            <a
              href={phoneHref}
              dir="ltr"
              className="font-display text-[clamp(1.5rem,4vw,2.125rem)] font-extrabold text-white transition-colors hover:text-brand-lime"
            >
              {phone}
            </a>
          ) : null}
        </div>
      </div>
    </motion.section>
  );
}
