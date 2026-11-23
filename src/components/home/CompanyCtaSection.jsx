import React from "react";
import { FaPhoneAlt } from "react-icons/fa";
import CtaLink from "@/components/ui/CtaLink";
import Reveal from "@/components/ui/Reveal";
import { useLocale } from "@/context/LocaleContext";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";

export default function CompanyCtaSection({ section }) {
  const { locale } = useLocale();
  const data = section?.data;
  const title = t(data?.title, locale);
  const body = t(data?.body, locale);
  const ctaLabel = t(data?.cta?.label, locale) || t(UI.nav.contact, locale);
  const href = data?.cta?.href || "/contact";
  const imageUrl = data?.imageUrl;

  if (!title && !body && !imageUrl) return null;

  return (
    <section className="relative isolate min-h-[420px] overflow-hidden bg-brand-black py-20 text-white sm:min-h-[480px] lg:min-h-[560px] lg:py-28">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          aria-hidden="true"
        />
      ) : null}
      <div className="absolute inset-0 bg-brand-black/70" aria-hidden="true" />
      <div
        className="absolute inset-0 bg-gradient-to-t from-brand-black/80 via-brand-black/45 to-brand-black/35"
        aria-hidden="true"
      />

      <div className="relative container mx-auto flex min-h-[inherit] items-center justify-center px-4 text-center lg:px-8">
        <Reveal className="max-w-3xl">
          <p className="mb-5 flex items-center justify-center gap-4 text-xs font-semibold uppercase tracking-[0.22em] text-white/85 sm:text-sm">
            <span className="hidden h-px w-12 bg-white/50 sm:block" aria-hidden="true" />
            <span>{t(UI.letsGetStarted, locale)}</span>
            <span className="hidden h-px w-12 bg-white/50 sm:block" aria-hidden="true" />
          </p>
          {title ? (
            <h2 className="mb-5 text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">
              {title}
            </h2>
          ) : null}
          {body ? (
            <p className="mx-auto mb-8 max-w-2xl text-sm leading-8 text-white/80 sm:text-base">
              {body}
            </p>
          ) : null}
          <CtaLink
            href={href}
            className="inline-flex min-h-12 items-center justify-center gap-2.5 rounded-md bg-brand-black px-8 py-3.5 text-sm font-bold text-white transition-colors hover:bg-brand-lime hover:text-brand-black"
          >
            <FaPhoneAlt className="text-brand-lime" aria-hidden="true" />
            <span>{ctaLabel}</span>
          </CtaLink>
        </Reveal>
      </div>
    </section>
  );
}
