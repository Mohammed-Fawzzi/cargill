import React from "react";
import { MdEmail, MdLocationOn } from "react-icons/md";
import { FaMobile } from "react-icons/fa6";
import CtaLink from "@/components/ui/CtaLink";
import { useLocale } from "@/context/LocaleContext";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";
import { toMapEmbedSrc } from "@/lib/map";

function InfoCard({ icon: Icon, title, children }) {
  if (!children) return null;
  return (
    <div className="rounded-2xl bg-white/5 p-6 text-center">
      <span className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-lime text-brand-black">
        <Icon className="text-xl" />
      </span>
      {title ? <h3 className="mb-2 font-extrabold text-white">{title}</h3> : null}
      <div className="space-y-1 text-sm leading-7 text-white/75">{children}</div>
    </div>
  );
}

export default function ContactSection({ section }) {
  const { locale } = useLocale();
  const contact = section?.contact;
  const title = t(section?.data?.title, locale);
  const body = t(section?.data?.body, locale);
  const ctaLabel = t(section?.data?.cta?.label, locale);
  const href = section?.data?.cta?.href || "/contact";
  const mapSrc = toMapEmbedSrc(section?.data?.mapEmbedUrl);
  const phones = contact?.phones || [];
  const emails = contact?.emails || [];
  const address = t(contact?.address, locale);

  return (
    <section className="bg-brand-ink py-16 text-white lg:py-20">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="mb-10 text-center">
          {title ? (
            <h2 className="mb-3 text-3xl font-extrabold">{title}</h2>
          ) : null}
          {body ? (
            <p className="mx-auto max-w-2xl text-sm leading-8 text-white/75">
              {body}
            </p>
          ) : null}
          {ctaLabel ? (
            <CtaLink
              href={href}
              className="mt-6 inline-flex rounded-full bg-brand-lime px-6 py-2.5 text-sm font-extrabold text-brand-black hover:bg-brand-lime-hover"
            >
              {ctaLabel}
            </CtaLink>
          ) : null}
        </div>

        <div className="mb-10 grid grid-cols-1 gap-5 md:grid-cols-3">
          <InfoCard icon={FaMobile} title={t(UI.phone, locale)}>
            {phones.map((phone) => (
              <a key={phone} href={`tel:${phone.replace(/\s+/g, "")}`} dir="ltr" className="block hover:text-brand-lime">
                {phone}
              </a>
            ))}
          </InfoCard>
          <InfoCard icon={MdEmail} title={t(UI.email, locale)}>
            {emails.map((email) => (
              <a key={email} href={`mailto:${email}`} className="block hover:text-brand-lime">
                {email}
              </a>
            ))}
          </InfoCard>
          <InfoCard icon={MdLocationOn} title={t(UI.address, locale)}>
            {address}
          </InfoCard>
        </div>

        {mapSrc ? (
          <div className="overflow-hidden rounded-3xl border border-white/10">
            <iframe
              title={title || t(UI.address, locale)}
              src={mapSrc}
              className="h-[360px] w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}
