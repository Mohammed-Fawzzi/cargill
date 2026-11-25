import React, { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { TriangleAccent } from "@/components/ui/TriangleMask";
import SectionRule from "@/components/ui/SectionRule";
import MagneticButton from "@/components/ui/MagneticButton";
import { useLocale } from "@/context/LocaleContext";
import { useSiteData } from "@/context/SiteDataContext";
import { toTelHref, toWhatsAppHref } from "@/lib/phone";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";
import { easeOut } from "@/lib/motion";
import useMotionPrefs from "@/hooks/useMotionPrefs";

const BrandTriangle3D = lazy(() => import("@/components/ui/BrandTriangle3D"));

const COMMITMENTS = [UI.commitQuality, UI.commitSupport, UI.commitField];

function accentLastWord(text) {
  const parts = String(text || "")
    .trim()
    .split(/(\s+)/);
  let lastIndex = -1;
  for (let i = parts.length - 1; i >= 0; i -= 1) {
    if (parts[i].trim()) {
      lastIndex = i;
      break;
    }
  }
  return parts.map((part, index) =>
    index === lastIndex ? (
      <span key={index} className="text-brand-lime">
        {part}
      </span>
    ) : (
      <span key={index}>{part}</span>
    ),
  );
}

export default function GrowTogetherBanner() {
  const { locale } = useLocale();
  const { contact } = useSiteData();
  const { reducedMotion } = useMotionPrefs();
  const phone = contact?.phones?.[0] || "";
  const phoneHref = toTelHref(phone);
  const waHref = toWhatsAppHref(phone, t(UI.askAgronomistMessage, locale));
  const title = t(UI.growTogetherTitle, locale);

  return (
    <section className="relative bg-brand-forest-deep py-[4.5rem] text-white lg:py-[7.5rem]">
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <Suspense
          fallback={
            <TriangleAccent className="absolute -bottom-10 -end-10 z-0 h-40 w-48 opacity-30 sm:-bottom-14 sm:-end-14 sm:h-52 sm:w-64 lg:h-64 lg:w-72" />
          }
        >
          <BrandTriangle3D className="absolute -bottom-10 -end-10 z-0 h-40 w-48 sm:-bottom-14 sm:-end-14 sm:h-52 sm:w-64 lg:h-64 lg:w-72" />
        </Suspense>
      </div>

      <motion.div
        className="relative z-10 container mx-auto px-4 lg:px-8"
        initial={reducedMotion ? false : { opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.35, ease: easeOut }}
      >
        <SectionRule
          label={t(UI.contactLabel, locale)}
          number="08"
          labelClassName="text-brand-lime"
          numberClassName="text-white/45"
          lineClassName="bg-white/20"
        />

        <h2 className="text-clip-safe mb-10 max-w-5xl text-[clamp(2.75rem,9vw,7.5rem)] font-extrabold leading-[1.12] tracking-tight">
          {accentLastWord(title)}
        </h2>

        <div className="mb-12 grid grid-cols-1 border-y border-white/15 md:grid-cols-3">
          {COMMITMENTS.map((item, index) => (
            <div
              key={item.en}
              className={`px-0 py-6 md:px-6 md:py-8 ${
                index > 0 ? "border-t border-white/15 md:border-t-0 md:border-s" : ""
              }`}
            >
              <p className="mb-3 text-[11px] font-bold tracking-[0.18em] text-brand-lime">
                {String(index + 1).padStart(2, "0")}
              </p>
              <p className="text-base font-semibold leading-8 text-white/85 sm:text-lg">
                {t(item, locale)}
              </p>
            </div>
          ))}
        </div>

        <div className="relative z-10 flex max-w-3xl flex-col gap-5 pe-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-8 lg:pe-8">
          {waHref ? (
            <MagneticButton strength={6}>
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex min-h-12 w-full items-center justify-center gap-2 bg-brand-lime px-6 text-sm font-extrabold text-brand-ink transition-colors hover:bg-brand-lime-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime sm:w-auto"
              >
                <span>{t(UI.askAgronomist, locale)}</span>
                <span
                  aria-hidden="true"
                  className="inline-block transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
                >
                  →
                </span>
              </a>
            </MagneticButton>
          ) : null}

          {phoneHref ? (
            <a
              href={phoneHref}
              dir="ltr"
              className="text-2xl font-extrabold tracking-tight text-white transition-colors hover:text-brand-lime focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime sm:text-3xl"
            >
              {phone}
            </a>
          ) : null}

          <Link
            to="/products"
            className="inline-flex w-fit items-center gap-2 border-b-2 border-brand-lime pb-0.5 text-sm font-bold text-white transition-[border-width] hover:border-b-[3px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime"
          >
            <span>{t(UI.exploreProducts, locale)}</span>
            <span aria-hidden="true">←</span>
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
