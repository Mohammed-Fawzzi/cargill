import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLocale } from "@/context/LocaleContext";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";
import { toMapEmbedSrc, toMapLink } from "@/lib/map";
import { easeOut } from "@/lib/motion";

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  return reduced;
}

const inputClass =
  "w-full border-0 border-b border-brand-ink/20 bg-transparent px-0 py-3 text-sm text-brand-ink outline-none transition-colors placeholder:text-brand-ink/35 focus:border-brand-lime";

export default function ContactSection({ section }) {
  const { locale } = useLocale();
  const reducedMotion = usePrefersReducedMotion();
  const contact = section?.contact;
  const title = t(section?.data?.title, locale) || t(UI.getInTouch, locale);
  const body = t(section?.data?.body, locale);
  const hoursLine = t(contact?.subtitle, locale) || body;
  const phones = contact?.phones || [];
  const emails = contact?.emails || [];
  const address = t(contact?.address, locale);
  const mapQuery = address || contact?.mapUrl || section?.data?.mapEmbedUrl || "";
  const mapSrc = toMapEmbedSrc(mapQuery);
  const mapLink = toMapLink(mapQuery);
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
      `${title} - ${form.firstName} ${form.lastName}`.trim(),
    );
    const mailBody = encodeURIComponent(
      `${form.firstName} ${form.lastName}\n${form.phone}\n${form.email}\n\n${form.message}`,
    );
    window.location.href = `mailto:${targetEmail}?subject=${subject}&body=${mailBody}`;
  };

  return (
    <section className="bg-surface-muted py-[4.5rem] sm:py-24 lg:py-[7.5rem]">
      <motion.div
        className="container mx-auto px-4 lg:px-8"
        initial={reducedMotion ? false : { opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.35, ease: easeOut }}
      >
        <div className="mb-12 grid grid-cols-1 gap-10 lg:mb-16 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <p className="mb-3 text-[11px] font-bold tracking-[0.18em] text-brand-ink/55">
              {t(UI.contactInfo, locale)}
            </p>
            <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-brand-ink sm:text-4xl lg:text-[2.75rem]">
              {title}
            </h2>
            {hoursLine ? (
              <p className="mb-8 text-sm leading-7 text-text-muted sm:text-base">
                {hoursLine}
              </p>
            ) : null}

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
              {phones.map((phone) => (
                <li key={phone} className="border-b border-brand-ink/10 py-4">
                  <p className="mb-1 text-[11px] font-bold tracking-[0.14em] text-text-muted">
                    {t(UI.phone, locale)}
                  </p>
                  <a
                    href={`tel:${phone.replace(/\s+/g, "")}`}
                    dir="ltr"
                    className="text-base font-semibold text-brand-ink transition-colors hover:text-brand-lime"
                  >
                    {phone}
                  </a>
                </li>
              ))}
              {emails.map((email) => (
                <li key={email} className="border-b border-brand-ink/10 py-4">
                  <p className="mb-1 text-[11px] font-bold tracking-[0.14em] text-text-muted">
                    {t(UI.email, locale)}
                  </p>
                  <a
                    href={`mailto:${email}`}
                    className="text-base font-semibold text-brand-ink transition-colors hover:text-brand-lime"
                  >
                    {email}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-6 lg:col-start-7">
            <div className="rounded-lg border border-brand-ink/10 bg-white p-5 sm:p-8">
              <form onSubmit={onSubmit} className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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
                    {t(UI.sendMessage, locale)}
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
          </div>
        </div>

        {mapSrc ? (
          <div>
            <div className="overflow-hidden rounded-lg">
              <iframe
                title={title || t(UI.address, locale)}
                src={mapSrc}
                className="h-[260px] w-full border-0 grayscale contrast-[1.1] md:h-[360px]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            {mapLink ? (
              <a
                href={mapLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 border-b-2 border-brand-lime pb-0.5 text-sm font-bold text-brand-ink transition-[border-width] hover:border-b-[3px]"
              >
                <span>{t(UI.openInMaps, locale)}</span>
                <span aria-hidden="true">←</span>
              </a>
            ) : null}
          </div>
        ) : null}
      </motion.div>
    </section>
  );
}
