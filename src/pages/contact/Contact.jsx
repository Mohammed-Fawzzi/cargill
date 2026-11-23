import React, { useState } from "react";
import { MdEmail, MdLocationOn } from "react-icons/md";
import { FaMobile } from "react-icons/fa6";
import Seo from "@/components/seo/Seo";
import PageBanner from "@/components/ui/PageBanner";
import { PageShell } from "@/components/ui/StatusMessage";
import { useLocale } from "@/context/LocaleContext";
import { useSiteData } from "@/context/SiteDataContext";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";
import { toMapEmbedSrc, toMapLink } from "@/lib/map";
import { resolveCompanySocial } from "@/utils/social";

export default function Contact() {
  const { locale } = useLocale();
  const { contact } = useSiteData();
  const heading = t(contact?.heading, locale) || t(UI.nav.contact, locale);
  const subtitle = t(contact?.subtitle, locale);
  const description = t(contact?.description, locale);
  const address = t(contact?.address, locale);
  const phones = contact?.phones || [];
  const emails = contact?.emails || [];
  const mapSrc = toMapEmbedSrc(contact?.mapUrl);
  const mapLink = toMapLink(contact?.mapUrl);
  const socials = resolveCompanySocial(contact?.social);
  const targetEmail = emails[0] || "";

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
    "w-full rounded-2xl border border-black/5 bg-white px-4 py-3 text-sm shadow-sm outline-none transition-colors focus:border-brand-lime";

  return (
    <>
      <Seo title={heading} description={description} path="/contact" />
      <PageShell>
        <PageBanner
          title={heading}
          subtitle={subtitle || description}
          imageUrl={contact?.bannerUrl}
        />
        <div className="container mx-auto grid gap-10 px-4 py-12 lg:grid-cols-2 lg:px-8">
          <div>
            {description ? (
              <p className="mb-8 whitespace-pre-wrap leading-8 text-text-muted">
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
                <button
                  type="submit"
                  className="sm:col-span-2 rounded-2xl bg-brand-black px-6 py-3 font-extrabold text-white transition-colors hover:bg-brand-forest"
                >
                  {t(UI.send, locale)}
                </button>
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
          </div>

          <div className="space-y-4">
            {phones.map((phone) => (
              <a
                key={phone}
                href={`tel:${phone.replace(/\s+/g, "")}`}
                className="flex items-center gap-3 rounded-2xl bg-surface-muted p-4 hover:bg-brand-lime/20"
              >
                <FaMobile className="text-brand-moss" />
                <span dir="ltr">{phone}</span>
              </a>
            ))}
            {emails.map((email) => (
              <a
                key={email}
                href={`mailto:${email}`}
                className="flex items-center gap-3 rounded-2xl bg-surface-muted p-4 hover:bg-brand-lime/20"
              >
                <MdEmail className="text-brand-moss" />
                <span>{email}</span>
              </a>
            ))}
            {address ? (
              <a
                href={mapLink || undefined}
                className="flex items-center gap-3 rounded-2xl bg-surface-muted p-4"
              >
                <MdLocationOn className="text-brand-moss" />
                <span>{address}</span>
              </a>
            ) : null}
            {socials.length > 0 ? (
              <div className="flex gap-2 pt-2">
                {socials.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.label}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-black text-white hover:bg-brand-lime hover:text-brand-black"
                  >
                    <link.Icon />
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        {mapSrc ? (
          <div className="container mx-auto px-4 pb-16 lg:px-8">
            <iframe
              title={heading}
              src={mapSrc}
              className="h-[380px] w-full overflow-hidden rounded-3xl border border-black/5"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        ) : null}
      </PageShell>
    </>
  );
}
