import React, { useState } from "react";
import Seo from "@/components/seo/Seo";
import Loading from "@/components/loading/Loading";
import PageBanner from "@/components/ui/PageBanner";
import Reveal from "@/components/ui/Reveal";
import { SecondaryButton } from "@/components/ui/AppButton";
import { EmptyState, ErrorState } from "@/components/ui/StatusMessage";
import { useHomepageSection } from "@/hooks/useHomepageSection";
import { useLocale } from "@/context/LocaleContext";
import { useSiteData } from "@/context/SiteDataContext";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";
import { toMapEmbedSrc, toMapLink } from "@/lib/map";
import { toTelHref, toWhatsAppHref } from "@/lib/phone";
import { resolveCompanySocial } from "@/utils/social";

const inputClass =
  "w-full border-0 border-b border-brand-ink/20 bg-transparent px-0 py-3 text-sm text-brand-ink outline-none transition-colors placeholder:text-brand-ink/35 focus:border-brand-lime";

function FastLink({ label, value, href, external = false }) {
  if (!href || !value) return null;
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="group flex items-center justify-between gap-4 border-b border-brand-ink/15 px-0 py-6 transition-colors lg:border-b-0 lg:border-e lg:px-6 lg:py-8 lg:last:border-e-0 lg:first:ps-0 lg:last:pe-0"
    >
      <span className="min-w-0">
        <span className="mb-2 block text-xs text-text-muted">{label}</span>
        <span
          className="block text-2xl font-extrabold tracking-tight text-brand-ink transition-colors group-hover:text-brand-lime"
          dir={/^\+?\d/.test(String(value)) ? "ltr" : undefined}
        >
          {value}
        </span>
      </span>
      <span
        className="shrink-0 text-brand-ink transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1 motion-reduce:transition-none"
        aria-hidden="true"
      >
        →
      </span>
    </a>
  );
}

export default function Contact() {
  const { locale } = useLocale();
  const { contact, isPending, isError } = useSiteData();
  const sectionQuery = useHomepageSection("contact");
  const section = sectionQuery.data;

  const heading =
    t(contact?.heading, locale) ||
    t(section?.title, locale) ||
    t(UI.nav.contact, locale);
  const hoursLine =
    t(contact?.subtitle, locale) || t(section?.body, locale) || "";
  const description = t(contact?.description, locale);
  const address = t(contact?.address, locale);
  const phones = contact?.phones || [];
  const emails = contact?.emails || [];
  const socials = resolveCompanySocial(contact?.social);
  const targetEmail = emails[0] || "";
  const mainPhone = phones[0] || "";
  const otherPhones = phones.slice(1);
  const bannerImage = contact?.bannerUrl || section?.imageUrl || "";
  const ctaLabel =
    t(section?.cta?.label, locale) || t(UI.sendMessage, locale);

  const mapQuery =
    address ||
    t(UI.alexMapAddress, locale) ||
    contact?.mapUrl ||
    section?.mapEmbedUrl ||
    "";
  const mapSrc = toMapEmbedSrc(mapQuery);
  const mapLink = toMapLink(mapQuery);

  const waHref = toWhatsAppHref(
    mainPhone,
    t(UI.askAgronomistMessage, locale),
  );
  const phoneHref = toTelHref(mainPhone);

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

  const pending = isPending;
  const error = isError;
  const hasContent = Boolean(
    phones.length || emails.length || address || description || hoursLine,
  );

  return (
    <>
      <Seo title={heading} description={description || hoursLine} path="/contact" />
      {pending ? <Loading /> : null}
      {!pending && error ? <ErrorState /> : null}
      {!pending && !error ? (
        <main className="min-h-screen bg-white">
          <PageBanner
            title={heading}
            subtitle={hoursLine}
            imageUrl={bannerImage}
            label={UI.pageLabel.contact}
            breadcrumbs={[
              { label: t(UI.nav.home, locale), to: "/" },
              { label: t(UI.nav.contact, locale) },
            ]}
          />

          {!hasContent ? (
            <EmptyState />
          ) : (
            <>
              <section className="border-b border-brand-ink/10">
                <div className="container mx-auto px-4 lg:px-8">
                  <Reveal>
                    <div className="grid grid-cols-1 lg:grid-cols-3">
                      <FastLink
                        label={t(UI.whatsapp, locale)}
                        value={mainPhone}
                        href={waHref}
                        external
                      />
                      <FastLink
                        label={t(UI.callUs, locale)}
                        value={mainPhone}
                        href={phoneHref}
                      />
                      <FastLink
                        label={t(UI.sendEmail, locale)}
                        value={targetEmail}
                        href={targetEmail ? `mailto:${targetEmail}` : ""}
                      />
                    </div>
                  </Reveal>
                </div>
              </section>

              <div className="bg-surface-muted py-12 lg:py-16">
                <div className="container mx-auto grid grid-cols-1 gap-10 px-4 lg:grid-cols-12 lg:gap-8 lg:px-8">
                  <Reveal className="order-2 lg:order-1 lg:col-span-5">
                    <ul>
                      {address ? (
                        <li className="border-b border-brand-ink/10 py-4">
                          <p className="mb-1 text-[11px] font-bold tracking-[0.14em] text-text-muted">
                            {t(UI.address, locale)}
                          </p>
                          <p className="text-base font-semibold leading-7 text-brand-ink">
                            {address}
                          </p>
                        </li>
                      ) : null}
                      {otherPhones.length ? (
                        <li className="border-b border-brand-ink/10 py-4">
                          <p className="mb-1 text-[11px] font-bold tracking-[0.14em] text-text-muted">
                            {t(UI.otherPhones, locale)}
                          </p>
                          <div className="space-y-1">
                            {otherPhones.map((phone) => (
                              <a
                                key={phone}
                                href={toTelHref(phone)}
                                dir="ltr"
                                className="block text-base font-semibold text-brand-ink transition-colors hover:text-brand-lime"
                              >
                                {phone}
                              </a>
                            ))}
                          </div>
                        </li>
                      ) : null}
                      {emails.length > 1 ? (
                        <li className="border-b border-brand-ink/10 py-4">
                          <p className="mb-1 text-[11px] font-bold tracking-[0.14em] text-text-muted">
                            {t(UI.email, locale)}
                          </p>
                          <div className="space-y-1">
                            {emails.slice(1).map((email) => (
                              <a
                                key={email}
                                href={`mailto:${email}`}
                                className="block text-base font-semibold text-brand-ink transition-colors hover:text-brand-lime"
                              >
                                {email}
                              </a>
                            ))}
                          </div>
                        </li>
                      ) : emails[0] ? (
                        <li className="border-b border-brand-ink/10 py-4">
                          <p className="mb-1 text-[11px] font-bold tracking-[0.14em] text-text-muted">
                            {t(UI.email, locale)}
                          </p>
                          <a
                            href={`mailto:${emails[0]}`}
                            className="text-base font-semibold text-brand-ink transition-colors hover:text-brand-lime"
                          >
                            {emails[0]}
                          </a>
                        </li>
                      ) : null}
                      {hoursLine ? (
                        <li className="border-b border-brand-ink/10 py-4">
                          <p className="mb-1 text-[11px] font-bold tracking-[0.14em] text-text-muted">
                            {t(UI.workingHours, locale)}
                          </p>
                          <p className="text-base font-semibold leading-7 text-brand-ink">
                            {hoursLine}
                          </p>
                        </li>
                      ) : null}
                    </ul>

                    {socials.length ? (
                      <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm font-bold text-brand-ink">
                        {socials.map((item, index) => (
                          <span
                            key={item.id}
                            className="inline-flex items-center gap-3"
                          >
                            {index > 0 ? (
                              <span
                                className="text-brand-ink/25"
                                aria-hidden="true"
                              >
                                ·
                              </span>
                            ) : null}
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline decoration-brand-lime decoration-1 underline-offset-4 transition-colors hover:text-brand-moss"
                            >
                              {item.label}
                            </a>
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </Reveal>

                  <Reveal
                    delay={0.06}
                    className="order-1 lg:order-2 lg:col-span-6 lg:col-start-7"
                  >
                    <div className="rounded-lg border border-brand-ink/10 bg-white p-5 sm:p-8">
                      <form
                        onSubmit={onSubmit}
                        className="grid grid-cols-1 gap-6 sm:grid-cols-2"
                      >
                        <label className="block">
                          <span className="mb-2 block text-[11px] font-bold tracking-[0.12em] text-text-muted">
                            {t(UI.firstName, locale)}
                          </span>
                          <input
                            name="firstName"
                            value={form.firstName}
                            onChange={onChange}
                            className={inputClass}
                            required
                          />
                        </label>
                        <label className="block">
                          <span className="mb-2 block text-[11px] font-bold tracking-[0.12em] text-text-muted">
                            {t(UI.lastName, locale)}
                          </span>
                          <input
                            name="lastName"
                            value={form.lastName}
                            onChange={onChange}
                            className={inputClass}
                            required
                          />
                        </label>
                        <label className="block">
                          <span className="mb-2 block text-[11px] font-bold tracking-[0.12em] text-text-muted">
                            {t(UI.phoneField, locale)}
                          </span>
                          <input
                            name="phone"
                            value={form.phone}
                            onChange={onChange}
                            className={inputClass}
                            dir="ltr"
                          />
                        </label>
                        <label className="block">
                          <span className="mb-2 block text-[11px] font-bold tracking-[0.12em] text-text-muted">
                            {t(UI.emailField, locale)}
                          </span>
                          <input
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={onChange}
                            className={inputClass}
                            dir="ltr"
                            required
                          />
                        </label>
                        <label className="block sm:col-span-2">
                          <span className="mb-2 block text-[11px] font-bold tracking-[0.12em] text-text-muted">
                            {t(UI.message, locale)}
                          </span>
                          <textarea
                            name="message"
                            value={form.message}
                            onChange={onChange}
                            rows={4}
                            className={`${inputClass} resize-none`}
                            required
                          />
                        </label>

                        {targetEmail ? (
                          <button
                            type="submit"
                            className="min-h-12 w-full bg-brand-ink text-sm font-extrabold text-white transition-colors hover:bg-brand-lime hover:text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime sm:col-span-2"
                          >
                            {ctaLabel}
                          </button>
                        ) : (
                          <p className="text-sm text-text-muted sm:col-span-2">
                            {t(UI.noEmail, locale)}
                          </p>
                        )}
                        {targetEmail ? (
                          <p className="text-xs text-text-muted sm:col-span-2">
                            {t(UI.contactFormHint, locale)}
                          </p>
                        ) : null}
                      </form>
                    </div>
                  </Reveal>
                </div>
              </div>

              {mapSrc ? (
                <div className="container mx-auto px-4 py-12 lg:px-8 lg:py-16">
                  <Reveal>
                    <div className="overflow-hidden rounded-lg">
                      <iframe
                        title={heading}
                        src={mapSrc}
                        className="h-[280px] w-full border-0 md:h-[420px]"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    </div>
                    {mapLink ? (
                      <SecondaryButton
                        href={mapLink}
                        className="mt-4"
                      >
                        {t(UI.openInMapsLink, locale)}
                      </SecondaryButton>
                    ) : null}
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
