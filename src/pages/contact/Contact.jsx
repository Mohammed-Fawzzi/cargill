import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Seo from "@/components/seo/Seo";
import Loading from "@/components/loading/Loading";
import AccentHeading from "@/components/ui/AccentHeading";
import LogoTriangle from "@/components/ui/LogoTriangle";
import GrowTogetherBanner from "@/components/home/GrowTogetherBanner";
import { EmptyState, ErrorState } from "@/components/ui/StatusMessage";
import { useHomepageSection } from "@/hooks/useHomepageSection";
import { useLocale } from "@/context/LocaleContext";
import { useSiteData } from "@/context/SiteDataContext";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";
import { toMapEmbedSrc, toMapLink } from "@/lib/map";
import { toTelHref, toWhatsAppHref } from "@/lib/phone";
import { resolveCompanySocial } from "@/utils/social";
import { easeOut } from "@/lib/motion";
import useMotionPrefs from "@/hooks/useMotionPrefs";

const inputClass =
  "w-full border-0 border-b border-white/30 bg-transparent px-0 py-2.5 text-[17px] text-white outline-none transition-colors placeholder:text-white/35 focus:border-brand-lime";

function FastLink({ label, value, href, external = false }) {
  if (!href || !value) return null;
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="group block border-b border-white/12 px-0 py-8 text-white transition-colors md:border-b-0 md:border-s md:px-8 md:py-[34px] md:first:border-s-0 md:first:ps-0"
    >
      <div className="text-[14px] text-white/60">{label}</div>
      <div
        className="mt-2.5 font-display text-[clamp(1.35rem,3vw,1.75rem)] font-extrabold transition-colors group-hover:text-brand-lime"
        dir={/^\+?\d/.test(String(value)) ? "ltr" : undefined}
      >
        {value}
      </div>
      <div className="mt-3.5 text-[20px] transition-transform duration-300 group-hover:-translate-x-1 rtl:group-hover:translate-x-1">
        ←
      </div>
    </a>
  );
}

export default function Contact() {
  const { locale } = useLocale();
  const { reducedMotion } = useMotionPrefs();
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
  const address =
    t(contact?.address, locale) || t(UI.alexMapAddress, locale) || "";
  const phones = contact?.phones || [];
  const emails = contact?.emails || [];
  const socials = resolveCompanySocial(contact?.social);
  const targetEmail = emails[0] || "";
  const mainPhone = phones[0] || "";
  const otherPhones = phones.slice(1);
  const ctaLabel =
    t(section?.cta?.label, locale) || t(UI.sendMessage, locale);

  const mapQuery =
    contact?.mapUrl ||
    address ||
    t(UI.alexMapAddress, locale) ||
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
  const [submitted, setSubmitted] = useState(false);

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
    setSubmitted(true);
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
        <main className="min-h-screen bg-[#0A0820] text-white">
          <header className="mx-auto max-w-[1320px] px-6 pb-14 pt-[calc(var(--navbar-height)+var(--ticker-height)+3.5rem)] md:pb-[56px] md:pt-[calc(var(--navbar-height)+var(--ticker-height)+4.5rem)]">
            <div className="flex items-center gap-4 text-[14px] text-white/62">
              <nav aria-label="Breadcrumb" className="shrink-0">
                <ol className="flex flex-wrap items-center gap-x-2">
                  <li>
                    <Link to="/" className="transition-colors hover:text-brand-lime">
                      {t(UI.nav.home, locale)}
                    </Link>
                  </li>
                  <li aria-hidden="true">/</li>
                  <li>{t(UI.nav.contact, locale)}</li>
                </ol>
              </nav>
              <span className="h-px flex-1 bg-white/14" aria-hidden="true" />
            </div>

            <div className="mt-7 flex flex-wrap items-end justify-between gap-8">
              <div className="min-w-0 flex-1">
                <div className="overflow-hidden py-[0.1em]">
                  <motion.div
                    initial={reducedMotion ? false : { y: "110%" }}
                    animate={{ y: "0%" }}
                    transition={{ duration: 0.65, ease: easeOut }}
                  >
                    <AccentHeading
                      as="h1"
                      text={heading}
                      className="max-w-full break-words font-display text-[clamp(2.75rem,8.5vw,7.5rem)] font-black leading-[1.1] text-white"
                    />
                  </motion.div>
                </div>
                {hoursLine ? (
                  <p className="mt-[22px] max-w-[560px] text-[18px] leading-[1.7] text-white/72 md:text-[20px]">
                    {hoursLine}
                  </p>
                ) : null}
              </div>
              <div
                className="flex items-center gap-2.5 font-mono text-[13px] tracking-[3px] text-white/70"
                dir="ltr"
              >
                <LogoTriangle className="h-3 w-3.5" />
                {UI.pageLabel.contact}
              </div>
            </div>
          </header>

          {!hasContent ? (
            <EmptyState />
          ) : (
            <>
              <div className="mx-auto max-w-[1320px] px-6">
                <div className="grid grid-cols-1 border-y border-white/12 md:grid-cols-3">
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
              </div>

              <section className="mx-auto grid max-w-[1320px] grid-cols-1 gap-12 px-6 py-20 md:grid-cols-[5fr_7fr] md:gap-16">
                <motion.div
                  initial={reducedMotion ? false : { opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.5, ease: easeOut }}
                >
                  <div className="flex items-center gap-4 text-[14px] text-white/70">
                    <span>{t(UI.contactDetails, locale)}</span>
                    <span className="h-px flex-1 bg-white/14" aria-hidden="true" />
                    <span className="font-mono text-brand-lime" dir="ltr">
                      § 01
                    </span>
                  </div>

                  <div className="mt-3">
                    {address ? (
                      <div className="border-b border-white/12 py-5">
                        <div className="text-[13px] text-white/60">
                          {t(UI.address, locale)}
                        </div>
                        <div className="mt-1.5 text-[18px] leading-[1.6]">
                          {address}
                        </div>
                      </div>
                    ) : null}

                    {otherPhones.length ? (
                      <div className="border-b border-white/12 py-5">
                        <div className="text-[13px] text-white/60">
                          {t(UI.otherPhones, locale)}
                        </div>
                        <div className="mt-1.5 space-y-1 text-[18px] leading-[1.6]">
                          {otherPhones.map((phone) => (
                            <a
                              key={phone}
                              href={toTelHref(phone)}
                              className="block transition-colors hover:text-brand-lime"
                            >
                              <bdi dir="ltr">{phone}</bdi>
                            </a>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {targetEmail ? (
                      <div className="border-b border-white/12 py-5">
                        <div className="text-[13px] text-white/60">
                          {t(UI.email, locale)}
                        </div>
                        <a
                          href={`mailto:${targetEmail}`}
                          className="mt-1.5 block text-[18px] leading-[1.6] transition-colors hover:text-brand-lime"
                          dir="ltr"
                        >
                          {targetEmail}
                        </a>
                      </div>
                    ) : null}

                    {hoursLine ? (
                      <div className="border-b border-white/12 py-5">
                        <div className="text-[13px] text-white/60">
                          {t(UI.workingHours, locale)}
                        </div>
                        <div className="mt-1.5 text-[18px] leading-[1.6]">
                          {hoursLine}
                        </div>
                      </div>
                    ) : null}
                  </div>

                  {socials.length ? (
                    <div className="mt-6 flex flex-wrap gap-5 text-[15px]">
                      {socials.map((item) => (
                        <a
                          key={item.id}
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white transition-colors hover:text-brand-lime"
                        >
                          {item.label}
                        </a>
                      ))}
                    </div>
                  ) : null}
                </motion.div>

                <motion.div
                  initial={reducedMotion ? false : { opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.12 }}
                  transition={{ duration: 0.5, ease: easeOut }}
                  className="rounded-2xl border border-white/10 bg-[#110E33] p-8 md:p-10"
                >
                  {submitted ? (
                    <div className="flex min-h-[280px] flex-col items-center justify-center gap-6 text-center">
                      <LogoTriangle className="h-14 w-16" />
                      <p className="max-w-xs text-lg font-extrabold leading-8">
                        {t(UI.formSuccessTitle, locale)}
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={onSubmit} className="flex flex-col gap-[26px]">
                      <div className="font-display text-[30px] font-extrabold">
                        {t(UI.sendUsMessage, locale)}
                      </div>

                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <label className="flex flex-col gap-1.5 text-[13px] text-white/65">
                          {t(UI.firstName, locale)}
                          <input
                            name="firstName"
                            value={form.firstName}
                            onChange={onChange}
                            className={inputClass}
                            required
                          />
                        </label>
                        <label className="flex flex-col gap-1.5 text-[13px] text-white/65">
                          {t(UI.lastName, locale)}
                          <input
                            name="lastName"
                            value={form.lastName}
                            onChange={onChange}
                            className={inputClass}
                            required
                          />
                        </label>
                      </div>

                      <label className="flex flex-col gap-1.5 text-[13px] text-white/65">
                        {t(UI.phoneField, locale)}
                        <input
                          name="phone"
                          value={form.phone}
                          onChange={onChange}
                          className={inputClass}
                          dir="ltr"
                          placeholder="01xxxxxxxxx"
                        />
                      </label>

                      <label className="flex flex-col gap-1.5 text-[13px] text-white/65">
                        {t(UI.emailField, locale)}
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

                      <label className="flex flex-col gap-1.5 text-[13px] text-white/65">
                        {t(UI.message, locale)}
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
                        <>
                          <button
                            type="submit"
                            className="rounded-lg bg-white py-[17px] text-[17px] font-semibold text-[#0A0820] transition-colors hover:bg-brand-lime"
                          >
                            {ctaLabel}
                          </button>
                          <p className="text-[13px] text-white/55">
                            {t(UI.contactFormHint, locale)}
                          </p>
                        </>
                      ) : (
                        <p className="text-[14px] text-white/60">
                          {t(UI.noEmail, locale)}
                        </p>
                      )}
                    </form>
                  )}
                </motion.div>
              </section>

              {mapSrc ? (
                <div className="mx-auto max-w-[1320px] px-6 pb-10">
                  <div className="overflow-hidden rounded-2xl border border-white/8">
                    <iframe
                      title={heading}
                      src={mapSrc}
                      className="h-[280px] w-full border-0 md:h-[400px]"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                  {mapLink ? (
                    <div className="mt-3.5">
                      <a
                        href={mapLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="border-b border-brand-lime pb-[3px] text-white transition-colors hover:text-brand-lime"
                      >
                        {t(UI.openInMapsLink, locale)} ←
                      </a>
                    </div>
                  ) : null}
                </div>
              ) : null}

              <GrowTogetherBanner />
            </>
          )}
        </main>
      ) : null}
    </>
  );
}
