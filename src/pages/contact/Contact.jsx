import React, { useState } from "react";
import { MdEmail, MdLocationOn } from "react-icons/md";
import { FaMobile } from "react-icons/fa6";
import Seo from "@/components/seo/Seo";
import Loading from "@/components/loading/Loading";
import PageBanner from "@/components/ui/PageBanner";
import Reveal from "@/components/ui/Reveal";
import MagneticButton from "@/components/ui/MagneticButton";
import { EmptyState, ErrorState } from "@/components/ui/StatusMessage";
import { useHomepageSection } from "@/hooks/useHomepageSection";
import { useLocale } from "@/context/LocaleContext";
import { useSiteData } from "@/context/SiteDataContext";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";
import { toMapEmbedSrc, toMapLink } from "@/lib/map";
import { resolveCompanySocial } from "@/utils/social";

export default function Contact() {
  const { locale } = useLocale();
  const { contact, isPending, isError } = useSiteData();
  const sectionQuery = useHomepageSection("contact");
  const section = sectionQuery.data;

  const heading =
    t(contact?.heading, locale) ||
    t(section?.title, locale) ||
    t(UI.nav.contact, locale);
  const subtitle =
    t(contact?.subtitle, locale) ||
    t(section?.body, locale) ||
    "";
  const description =
    t(contact?.description, locale) ||
    t(section?.body, locale) ||
    "";
  const address = t(contact?.address, locale);
  const phones = contact?.phones || [];
  const emails = contact?.emails || [];
  const mapSrc = toMapEmbedSrc(contact?.mapUrl || section?.mapEmbedUrl);
  const mapLink = toMapLink(contact?.mapUrl || section?.mapEmbedUrl);
  const socials = resolveCompanySocial(contact?.social);
  const targetEmail = emails[0] || "";
  const bannerImage = contact?.bannerUrl || section?.imageUrl || "";
  const ctaLabel =
    t(section?.cta?.label, locale) || t(UI.send, locale);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    message: "",
  });

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = (event) => {
    event.preventDefault();
    if (!targetEmail) return;
    const subject = encodeURIComponent(
      `${heading} - ${form.firstName} ${form.lastName}`.trim(),
    );
    const body = encodeURIComponent(
      `${form.firstName} ${form.lastName}\n${form.phone}\n${form.email}\n\n${form.message}`,
    );
    window.location.href = `mailto:${targetEmail}?subject=${subject}&body=${body}`;
  };

  const inputClass =
    "w-full rounded-2xl border border-brand-ink/10 bg-white px-4 py-3.5 text-sm shadow-sm outline-none transition-all focus:border-brand-lime focus:shadow-[0_0_0_3px_rgba(136,196,60,0.18)]";

  const pending = isPending;
  const error = isError;

  return (
    <>
      <Seo title={heading} description={description || subtitle} path="/contact" />
      {pending ? <Loading /> : null}
      {!pending && error ? <ErrorState /> : null}
      {!pending && !error ? (
        <main className="min-h-screen bg-white">
          <PageBanner
            title={heading}
            subtitle={subtitle || description}
            imageUrl={bannerImage}
            variant="center"
            eyebrow={t(contact?.companyName, locale) || heading}
          />

          {!phones.length && !emails.length && !address && !description ? (
            <EmptyState />
          ) : (
            <>
              <div className="container mx-auto grid gap-10 px-4 py-12 lg:grid-cols-2 lg:gap-14 lg:px-8 lg:py-16">
                <Reveal>
                  {description ? (
                    <p className="mb-8 whitespace-pre-wrap text-base leading-8 text-text-muted sm:text-lg">
                      {description}
                    </p>
                  ) : null}
                  <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <input
                      name="firstName"
                      value={form.firstName}
                      onChange={onChange}
                      className={inputClass}
                      placeholder={t(UI.firstName, locale)}
                    />
                    <input
                      name="lastName"
                      value={form.lastName}
                      onChange={onChange}
                      className={inputClass}
                      placeholder={t(UI.lastName, locale)}
                    />
                    <input
                      name="phone"
                      value={form.phone}
                      onChange={onChange}
                      className={inputClass}
                      placeholder={t(UI.phoneField, locale)}
                      dir="ltr"
                    />
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={onChange}
                      className={inputClass}
                      placeholder={t(UI.emailField, locale)}
                      dir="ltr"
                    />
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={onChange}
                      rows={5}
                      className={`${inputClass} sm:col-span-2`}
                      placeholder={t(UI.message, locale)}
                    />
                    {targetEmail ? (
                      <MagneticButton className="sm:col-span-2">
                        <button
                          type="submit"
                          className="w-full rounded-2xl bg-brand-forest-deep px-6 py-3.5 font-extrabold text-white transition-all hover:bg-brand-lime hover:text-brand-ink"
                        >
                          {ctaLabel}
                        </button>
                      </MagneticButton>
                    ) : (
                      <p className="sm:col-span-2 text-sm text-text-muted">
                        {t(UI.noEmail, locale)}
                      </p>
                    )}
                    {targetEmail ? (
                      <p className="sm:col-span-2 text-xs text-text-muted">
                        {t(UI.contactFormHint, locale)}
                      </p>
                    ) : null}
                  </form>
                </Reveal>

                <Reveal delay={0.08} className="space-y-4">
                  {phones.map((phone) => (
                    <a
                      key={phone}
                      href={`tel:${phone.replace(/\s+/g, "")}`}
                      className="flex items-center gap-3 rounded-2xl border border-brand-ink/5 bg-surface-muted p-5 transition-all hover:border-brand-lime/40 hover:shadow-[0_12px_30px_rgba(24,16,96,0.08)]"
                    >
                      <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-lime/15 text-brand-lime">
                        <FaMobile aria-hidden="true" />
                      </span>
                      <span dir="ltr">{phone}</span>
                    </a>
                  ))}
                  {emails.map((email) => (
                    <a
                      key={email}
                      href={`mailto:${email}`}
                      className="flex items-center gap-3 rounded-2xl border border-brand-ink/5 bg-surface-muted p-5 transition-all hover:border-brand-lime/40 hover:shadow-[0_12px_30px_rgba(24,16,96,0.08)]"
                    >
                      <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-lime/15 text-brand-lime">
                        <MdEmail aria-hidden="true" />
                      </span>
                      <span>{email}</span>
                    </a>
                  ))}
                  {address ? (
                    <a
                      href={mapLink || undefined}
                      className="flex items-center gap-3 rounded-2xl border border-brand-ink/5 bg-surface-muted p-5"
                    >
                      <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-lime/15 text-brand-lime">
                        <MdLocationOn aria-hidden="true" />
                      </span>
                      <span>{address}</span>
                    </a>
                  ) : null}
                  {socials.length > 0 ? (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {socials.map((link) => (
                        <a
                          key={link.id}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={link.label}
                          className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-forest-deep text-white transition-colors hover:bg-brand-lime hover:text-brand-ink"
                        >
                          <link.Icon />
                        </a>
                      ))}
                    </div>
                  ) : null}
                </Reveal>
              </div>

              {mapSrc ? (
                <div className="container mx-auto px-4 pb-16 lg:px-8">
                  <Reveal>
                    <iframe
                      title={heading}
                      src={mapSrc}
                      className="h-[380px] w-full overflow-hidden rounded-[1.75rem] border border-black/5 shadow-[0_16px_40px_rgba(24,16,96,0.08)]"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </Reveal>
                </div>
              ) : null}
            </>
          )}
        </main>
      ) : null}
    </>
  );
}
