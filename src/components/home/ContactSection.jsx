import React from "react";
import { MdEmail, MdLocationOn } from "react-icons/md";
import { FaMobile } from "react-icons/fa6";
import CtaLink from "@/components/ui/CtaLink";
import Reveal from "@/components/ui/Reveal";
import { useLocale } from "@/context/LocaleContext";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";
import { toMapEmbedSrc } from "@/lib/map";

export default function ContactSection({ section }) {
  const { locale } = useLocale();
  const contact = section?.contact;
  const title = t(section?.data?.title, locale) || t(UI.getInTouch, locale);
  const body = t(section?.data?.body, locale);
  const ctaLabel = t(section?.data?.cta?.label, locale);
  const href = section?.data?.cta?.href || "/contact";
  const mapSrc = toMapEmbedSrc(section?.data?.mapEmbedUrl);
  const phones = contact?.phones || [];
  const emails = contact?.emails || [];
  const address = t(contact?.address, locale);

  return (
    <section className="bg-white">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <Reveal className="relative min-h-[360px] bg-surface-muted lg:min-h-[520px]">
          {mapSrc ? (
            <iframe
              title={title || t(UI.address, locale)}
              src={mapSrc}
              className="absolute inset-0 h-full w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          ) : (
            <div className="flex h-full min-h-[360px] items-center justify-center px-6 text-center text-text-muted lg:min-h-[520px]">
              {t(UI.address, locale)}
            </div>
          )}
        </Reveal>

        <Reveal
          delay={0.08}
          className="flex items-center bg-brand-black px-6 py-14 text-white sm:px-10 lg:px-14 lg:py-16"
        >
          <div className="w-full max-w-lg">
            <h2 className="mb-4 text-3xl font-extrabold text-brand-lime sm:text-4xl">
              {title}
            </h2>
            {body ? (
              <p className="mb-8 text-sm leading-8 text-white/75 sm:text-base">
                {body}
              </p>
            ) : null}

            <ul className="space-y-5 text-sm leading-7 text-white/85 sm:text-base">
              {address ? (
                <li className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-lime/15 text-brand-lime">
                    <MdLocationOn aria-hidden="true" />
                  </span>
                  <span>{address}</span>
                </li>
              ) : null}
              {phones.map((phone) => (
                <li key={phone} className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-lime/15 text-brand-lime">
                    <FaMobile aria-hidden="true" />
                  </span>
                  <a
                    href={`tel:${phone.replace(/\s+/g, "")}`}
                    dir="ltr"
                    className="transition-colors hover:text-brand-lime"
                  >
                    {phone}
                  </a>
                </li>
              ))}
              {emails.map((email) => (
                <li key={email} className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-lime/15 text-brand-lime">
                    <MdEmail aria-hidden="true" />
                  </span>
                  <a
                    href={`mailto:${email}`}
                    className="transition-colors hover:text-brand-lime"
                  >
                    {email}
                  </a>
                </li>
              ))}
            </ul>

            {ctaLabel ? (
              <CtaLink
                href={href}
                className="mt-10 inline-flex min-h-12 items-center justify-center rounded-md bg-brand-lime px-7 py-3 text-sm font-extrabold text-brand-black transition-colors hover:bg-brand-lime-hover"
              >
                {ctaLabel}
              </CtaLink>
            ) : null}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
