import React, { useRef } from "react";
import { FaPhoneAlt } from "react-icons/fa";
import { motion, useScroll, useTransform } from "framer-motion";
import CtaLink from "@/components/ui/CtaLink";
import MagneticButton from "@/components/ui/MagneticButton";
import Reveal from "@/components/ui/Reveal";
import { useLocale } from "@/context/LocaleContext";
import { normalizeImageUrl } from "@/lib/image";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";

export default function CompanyCtaSection({ section }) {
  const { locale } = useLocale();
  const data = section?.data;
  const title = t(data?.title, locale);
  const body = t(data?.body, locale);
  const ctaLabel = t(data?.cta?.label, locale) || t(UI.nav.contact, locale);
  const href = data?.cta?.href || "/contact";
  const imageUrl = normalizeImageUrl(data?.imageUrl || "", {
    width: 1920,
    quality: 72,
  });
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  if (!title && !body && !imageUrl) return null;

  return (
    <section
      ref={sectionRef}
      className="relative isolate min-h-[440px] overflow-hidden bg-brand-forest-deep py-20 text-white sm:min-h-[500px] lg:min-h-[580px] lg:py-28"
    >
      {imageUrl ? (
        <motion.img
          src={imageUrl}
          alt=""
          style={{ y: imageY }}
          className="absolute inset-0 h-[120%] w-full object-cover will-change-transform"
          aria-hidden="true"
          loading="lazy"
          decoding="async"
        />
      ) : null}
      <div className="absolute inset-0 bg-brand-forest-deep/72" aria-hidden="true" />
      <div
        className="absolute inset-0 bg-gradient-to-t from-brand-black/85 via-brand-forest-deep/40 to-brand-black/30"
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-lime/50 to-transparent"
        aria-hidden="true"
      />

      <div className="relative container mx-auto flex min-h-[inherit] items-center justify-center px-4 text-center lg:px-8">
        <Reveal className="max-w-3xl">
          <p className="mb-5 flex items-center justify-center gap-4 text-xs font-semibold uppercase tracking-[0.24em] text-brand-lime sm:text-sm">
            <span className="hidden h-px w-14 bg-brand-lime/60 sm:block" aria-hidden="true" />
            <span>{t(UI.letsGetStarted, locale)}</span>
            <span className="hidden h-px w-14 bg-brand-lime/60 sm:block" aria-hidden="true" />
          </p>
          {title ? (
            <h2 className="mb-5 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              {title}
            </h2>
          ) : null}
          {body ? (
            <p className="mx-auto mb-9 max-w-2xl text-sm leading-8 text-white/80 sm:text-base">
              {body}
            </p>
          ) : null}
          <MagneticButton>
            <CtaLink
              href={href}
              className="group inline-flex min-h-12 items-center justify-center gap-2.5 rounded-md bg-brand-black px-8 py-3.5 text-sm font-bold text-white shadow-[0_14px_34px_rgba(24,16,96,0.28)] transition-all duration-300 hover:bg-brand-lime hover:text-brand-navy"
            >
              <FaPhoneAlt
                className="text-brand-lime transition-colors group-hover:text-brand-navy"
                aria-hidden="true"
              />
              <span>{ctaLabel}</span>
            </CtaLink>
          </MagneticButton>
        </Reveal>
      </div>
    </section>
  );
}
