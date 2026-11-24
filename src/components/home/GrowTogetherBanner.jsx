import React from "react";
import { Link } from "react-router-dom";
import Reveal from "@/components/ui/Reveal";
import MagneticButton from "@/components/ui/MagneticButton";
import { useLocale } from "@/context/LocaleContext";
import { useSiteData } from "@/context/SiteDataContext";
import { toTelHref } from "@/lib/phone";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";

const COMMITMENTS = [UI.commitQuality, UI.commitSupport, UI.commitField];

export default function GrowTogetherBanner() {
  const { locale } = useLocale();
  const { contact } = useSiteData();
  const phone = contact?.phones?.[0] || "";
  const phoneHref = toTelHref(phone);

  return (
    <section className="relative overflow-hidden bg-surface-muted py-16 lg:py-20">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(136,196,60,0.14),transparent_35%),radial-gradient(circle_at_10%_80%,rgba(24,16,96,0.06),transparent_40%)]"
        aria-hidden="true"
      />
      <div className="relative container mx-auto px-4 text-center lg:px-8">
        <Reveal className="mx-auto max-w-3xl">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-brand-moss">
            {t(UI.growTogetherEyebrow, locale)}
          </p>
          <h2 className="mb-5 text-2xl font-extrabold tracking-tight text-brand-ink sm:text-4xl lg:text-5xl">
            {t(UI.growTogetherTitle, locale)}
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-sm leading-8 text-text-muted sm:text-base">
            {t(UI.growTogetherBody, locale)}
          </p>

          <ul className="mx-auto mb-9 flex max-w-2xl flex-col gap-2 text-start sm:text-center">
            {COMMITMENTS.map((item) => (
              <li
                key={item.en}
                className="text-sm font-semibold leading-7 text-brand-ink/80 sm:text-base"
              >
                • {t(item, locale)}
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <MagneticButton>
              <Link
                to="/contact"
                className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-md bg-brand-ink px-7 text-sm font-bold text-white transition-colors hover:bg-brand-lime hover:text-brand-ink"
              >
                {t(UI.nav.contact, locale)}
              </Link>
            </MagneticButton>
            <MagneticButton>
              <Link
                to="/products"
                className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-md border border-brand-ink/15 bg-white px-7 text-sm font-bold text-brand-ink transition-colors hover:border-brand-lime hover:bg-brand-lime"
              >
                {t(UI.exploreProducts, locale)}
              </Link>
            </MagneticButton>
            {phoneHref ? (
              <MagneticButton>
                <a
                  href={phoneHref}
                  className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-md border border-brand-ink/15 bg-white px-7 text-sm font-bold text-brand-ink transition-colors hover:border-brand-lime hover:bg-brand-lime"
                  dir="ltr"
                >
                  {phone}
                </a>
              </MagneticButton>
            ) : null}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
