import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import Seo from "@/components/seo/Seo";
import Loading from "@/components/loading/Loading";
import PageHero from "@/components/ui/PageHero";
import LogoTriangle from "@/components/ui/LogoTriangle";
import GrowTogetherBanner from "@/components/shared/GrowTogetherBanner";
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
import { homepageSlideImages } from "@/lib/homeIntro";
import useMotionPrefs from "@/hooks/useMotionPrefs";

const inputClass =
  "w-full bg-[#1F1D35] px-4 py-3 text-[15px] text-white outline-none transition-colors placeholder:text-white/35 focus:bg-[#292740]";

function QuickCard({ label, value, href, action, external = false }) {
  if (!href || !value) return null;
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="group relative flex flex-col justify-between overflow-hidden bg-[#1B1931] p-6 transition-colors hover:bg-[#1F1D35] md:p-7"
    >
      <span className="absolute inset-x-0 top-0 h-0.5 bg-transparent transition-colors group-hover:bg-brand-lime" />
      <div className="mb-8 flex items-center justify-between gap-3">
        <span className="text-[11px] font-semibold tracking-wide text-white/50 uppercase">
          {label}
        </span>
      </div>
      <div>
        <span
          className="block font-display text-[clamp(1.15rem,2.5vw,1.375rem)] font-semibold tracking-wide text-white transition-colors group-hover:text-brand-lime"
          dir={/^\+?\d|@/.test(String(value)) ? "ltr" : undefined}
        >
          {value}
        </span>
        {action ? (
          <div className="mt-4 flex items-center gap-1 text-sm text-brand-lime">
            <span>{action}</span>
            <span
              aria-hidden="true"
              className="transition-transform group-hover:-translate-x-1 rtl:group-hover:translate-x-1"
            >
              ←
            </span>
          </div>
        ) : null}
      </div>
    </a>
  );
}

export default function Contact() {
  const { locale } = useLocale();
  const { reducedMotion } = useMotionPrefs();
  const { contact, isPending, isError } = useSiteData();
  const sectionQuery = useHomepageSection("contact");
  const heroQuery = useHomepageSection("hero");
  const section = sectionQuery.data;
  const heroSlides = useMemo(
    () => homepageSlideImages(heroQuery.data),
    [heroQuery.data],
  );
  const contactImage =
    section?.imageUrl ||
    section?.slides?.[0]?.imageUrl ||
    contact?.bannerUrl ||
    "";
  const contactSides = [
    contact?.bannerUrl,
    contact?.aboutImageUrl,
    ...heroSlides,
  ].filter(
    (src, index, list) =>
      src && src !== contactImage && list.indexOf(src) === index,
  );

  const heading =
    t(contact?.heading, locale) ||
    t(section?.title, locale) ||
    t(UI.nav.contact, locale);
  const hoursLine =
    t(contact?.subtitle, locale) || t(section?.body, locale) || "";
  const description = t(contact?.description, locale);
  const address = t(contact?.address, locale) || "";
  const phones = contact?.phones || [];
  const emails = contact?.emails || [];
  const socials = resolveCompanySocial(contact?.social);
  const targetEmail = emails[0] || "";
  const mainPhone = phones[0] || "";
  const otherPhones = phones.slice(1);
  const ctaLabel =
    t(section?.cta?.label, locale) || t(UI.sendMessage, locale);

  const mapQuery = address || contact?.mapUrl || "";
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
        <main className="min-h-screen bg-transparent text-white">
          <PageHero
            title={heading}
            description={hoursLine || description}
            imageUrl={contactImage}
            videoUrl={section?.videoUrl || contact?.videoUrl || ""}
            videoUrls={[
              section?.videoUrl,
              contact?.videoUrl,
              contact?.aboutVideoUrl,
            ].filter(Boolean)}
            sideImages={contactSides}
            size="mid"
            crumbs={[
              { label: t(UI.nav.home, locale), to: "/" },
              { label: t(UI.nav.contact, locale) },
            ]}
          />

          {!hasContent ? (
            <EmptyState />
          ) : (
            <>
              <div className="mx-auto max-w-6xl px-4 sm:px-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <QuickCard
                    label={t(UI.whatsapp, locale)}
                    value={mainPhone}
                    href={waHref}
                    action={t(UI.whatsapp, locale)}
                    external
                  />
                  <QuickCard
                    label={t(UI.callUs, locale)}
                    value={mainPhone}
                    href={phoneHref}
                    action={t(UI.callUs, locale)}
                  />
                  <QuickCard
                    label={t(UI.sendEmail, locale)}
                    value={targetEmail}
                    href={targetEmail ? `mailto:${targetEmail}` : ""}
                    action={t(UI.sendEmail, locale)}
                  />
                </div>
              </div>

              <section className="mx-auto grid max-w-6xl grid-cols-1 items-start gap-4 px-4 py-10 sm:px-6 md:py-14 lg:grid-cols-12 lg:gap-5">
                <motion.div
                  className="bg-[#1B1931] p-6 md:p-8 lg:col-span-7"
                  initial={reducedMotion ? false : { opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.12 }}
                  transition={{ duration: 0.5, ease: easeOut }}
                >
                  {submitted ? (
                    <div className="flex min-h-[280px] flex-col items-center justify-center gap-6 text-center">
                      <LogoTriangle className="h-14 w-16" />
                      <p className="max-w-xs text-lg font-extrabold leading-8">
                        {t(UI.formSuccessTitle, locale)}
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={onSubmit} className="flex flex-col gap-5">
                      <div>
                        <div className="mb-2 flex items-center gap-2">
                          <span className="h-2 w-2 bg-brand-lime" aria-hidden="true" />
                          <h2 className="font-display text-[clamp(1.5rem,3vw,2rem)] font-semibold text-white">
                            {t(UI.sendUsMessage, locale)}
                          </h2>
                        </div>
                        {description ? (
                          <p className="text-[15px] leading-relaxed text-white/55">
                            {description}
                          </p>
                        ) : null}
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <label className="flex flex-col gap-1.5 text-[11px] font-semibold tracking-wide text-white/55">
                          {t(UI.firstName, locale)}
                          <input
                            name="firstName"
                            value={form.firstName}
                            onChange={onChange}
                            className={inputClass}
                            required
                          />
                        </label>
                        <label className="flex flex-col gap-1.5 text-[11px] font-semibold tracking-wide text-white/55">
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

                      <label className="flex flex-col gap-1.5 text-[11px] font-semibold tracking-wide text-white/55">
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

                      <label className="flex flex-col gap-1.5 text-[11px] font-semibold tracking-wide text-white/55">
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

                      <label className="flex flex-col gap-1.5 text-[11px] font-semibold tracking-wide text-white/55">
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
                            className="flex w-full items-center justify-center gap-2 bg-brand-lime py-4 text-[17px] font-semibold text-[#0A0820] transition-colors hover:bg-brand-lime-hover"
                          >
                            <span>{ctaLabel}</span>
                          </button>
                          <p className="text-center text-[13px] text-white/50">
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

                <motion.div
                  className="flex flex-col gap-4 lg:col-span-5"
                  initial={reducedMotion ? false : { opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.5, delay: reducedMotion ? 0 : 0.06, ease: easeOut }}
                >
                  <div className="flex flex-col gap-6 bg-[#1B1931] p-6 md:p-8">
                    <h2 className="font-display text-[22px] font-semibold text-white">
                      {t(UI.contactDetails, locale)}
                    </h2>

                    {address ? (
                      <div>
                        <span className="block text-[11px] font-semibold tracking-wide text-white/45 uppercase">
                          {t(UI.address, locale)}
                        </span>
                        <p className="mt-1.5 text-[15px] font-medium leading-relaxed text-white">
                          {address}
                        </p>
                      </div>
                    ) : null}

                    {otherPhones.length ? (
                      <div>
                        <span className="block text-[11px] font-semibold tracking-wide text-white/45 uppercase">
                          {t(UI.otherPhones, locale)}
                        </span>
                        <div className="mt-1.5 space-y-1 text-[15px] text-white">
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

                    {mainPhone && !otherPhones.length ? (
                      <div>
                        <span className="block text-[11px] font-semibold tracking-wide text-white/45 uppercase">
                          {t(UI.phone, locale)}
                        </span>
                        <a
                          href={phoneHref}
                          className="mt-1.5 block text-[15px] transition-colors hover:text-brand-lime"
                        >
                          <bdi dir="ltr">{mainPhone}</bdi>
                        </a>
                      </div>
                    ) : null}

                    {targetEmail ? (
                      <div>
                        <span className="block text-[11px] font-semibold tracking-wide text-white/45 uppercase">
                          {t(UI.email, locale)}
                        </span>
                        <a
                          href={`mailto:${targetEmail}`}
                          className="mt-1.5 block text-[15px] transition-colors hover:text-brand-lime"
                          dir="ltr"
                        >
                          {targetEmail}
                        </a>
                      </div>
                    ) : null}

                    {hoursLine ? (
                      <div>
                        <span className="block text-[11px] font-semibold tracking-wide text-white/45 uppercase">
                          {t(UI.workingHours, locale)}
                        </span>
                        <p className="mt-1.5 text-[15px] leading-relaxed text-white">
                          {hoursLine}
                        </p>
                      </div>
                    ) : null}

                    {socials.length ? (
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-2 bg-[#1F1D35]/60 p-4 text-sm">
                        {socials.map((item, index) => (
                          <React.Fragment key={item.id}>
                            {index > 0 ? (
                              <span className="text-white/25" aria-hidden="true">
                                ·
                              </span>
                            ) : null}
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-white/60 transition-colors hover:text-brand-lime"
                            >
                              {item.label}
                            </a>
                          </React.Fragment>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </motion.div>
              </section>

              {mapSrc ? (
                <div className="mx-auto max-w-6xl px-4 pb-10 sm:px-6">
                  <div className="mb-3 flex items-center justify-between gap-4">
                    <h3 className="font-display text-[22px] font-medium text-white">
                      {t(UI.address, locale)}
                    </h3>
                    {mapLink ? (
                      <a
                        href={mapLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-brand-lime transition-colors hover:text-white"
                      >
                        <span>{t(UI.openInMapsLink, locale)}</span>
                        <span aria-hidden="true">←</span>
                      </a>
                    ) : null}
                  </div>
                  <div className="overflow-hidden bg-[#0D0B23]">
                    <iframe
                      title={heading}
                      src={mapSrc}
                      className="h-[280px] w-full border-0 md:h-[380px]"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
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
