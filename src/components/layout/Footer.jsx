import React from "react";
import { Link } from "react-router-dom";
import { MdEmail, MdLocationOn } from "react-icons/md";
import { FaMobile } from "react-icons/fa6";
import SiteLogo from "@/components/ui/SiteLogo";
import { NAV_LINKS } from "@constants/navLinks";
import { useLocale } from "@/context/LocaleContext";
import { useSiteData } from "@/context/SiteDataContext";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";
import { resolveCompanySocial } from "@/utils/social";
import { toMapLink } from "@/lib/map";

function ContactItem({ icon, children, href, dir }) {
  if (!children) return null;
  const content = (
    <>
      <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-lime/15 text-brand-lime">
        {React.createElement(icon, { className: "text-base", "aria-hidden": true })}
      </span>
      <span className="min-w-0 leading-7" dir={dir}>
        {children}
      </span>
    </>
  );
  const className =
    "flex items-start gap-2.5 text-sm text-white/80 transition-colors duration-300 hover:text-brand-lime";
  if (href) {
    return (
      <li>
        <a href={href} className={className}>
          {content}
        </a>
      </li>
    );
  }
  return <li className={className}>{content}</li>;
}

export default function Footer() {
  const { locale } = useLocale();
  const { contact, footer } = useSiteData();
  const companyName = t(contact?.companyName, locale);
  const description = t(footer?.body, locale) || t(contact?.about, locale);
  const title = t(footer?.title, locale);
  const address = t(contact?.address, locale);
  const phones = contact?.phones || [];
  const emails = contact?.emails || [];
  const socials = resolveCompanySocial(contact?.social);
  const mapLink = toMapLink(contact?.mapUrl);
  const year = new Date().getFullYear();
  const background = footer?.imageUrl;

  return (
    <footer
      className="relative overflow-hidden bg-brand-forest-deep text-white"
      aria-label="footer"
    >
      {background ? (
        <div
          className="pointer-events-none absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${background})` }}
          aria-hidden="true"
        />
      ) : null}
      <div
        className={`pointer-events-none absolute inset-0 ${
          background
            ? "bg-brand-black/85"
            : "bg-gradient-to-t from-brand-black via-brand-forest-deep/95 to-brand-forest-deep"
        }`}
        aria-hidden="true"
      />

      <div className="relative container mx-auto px-4 py-14 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">
          <div>
            <div className="mb-5">
              <SiteLogo
                alt={companyName || title}
                className="h-14 w-auto max-w-[180px] object-contain"
              />
            </div>
            {title ? (
              <p className="mb-3 text-lg font-bold leading-7">{title}</p>
            ) : companyName ? (
              <p className="mb-3 text-lg font-bold leading-7">{companyName}</p>
            ) : null}
            {description ? (
              <p className="mb-7 max-w-sm text-sm leading-7 text-white/70">
                {description}
              </p>
            ) : null}
            {socials.length > 0 ? (
              <div className="flex flex-wrap gap-2.5">
                {socials.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.label}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-lime/15 text-white transition-colors duration-300 hover:bg-brand-lime hover:text-brand-black"
                  >
                    {React.createElement(link.Icon, {
                      className: "text-base",
                      "aria-hidden": true,
                    })}
                  </a>
                ))}
              </div>
            ) : null}
          </div>

          <div>
            <h3 className="mb-5 text-base font-bold text-brand-lime">
              {t(UI.contactInfo, locale)}
            </h3>
            <ul className="space-y-3.5">
              <ContactItem icon={MdLocationOn} href={mapLink || undefined}>
                {address}
              </ContactItem>
              {phones.map((phone) => (
                <ContactItem
                  key={phone}
                  icon={FaMobile}
                  href={`tel:${phone.replace(/\s+/g, "")}`}
                  dir="ltr"
                >
                  {phone}
                </ContactItem>
              ))}
              {emails.map((email) => (
                <ContactItem key={email} icon={MdEmail} href={`mailto:${email}`}>
                  {email}
                </ContactItem>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-5 text-base font-bold text-brand-lime">
              {t(UI.usefulLinks, locale)}
            </h3>
            <ul className="space-y-2.5">
              {NAV_LINKS.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm leading-7 text-white/80 transition-colors duration-300 hover:text-brand-lime"
                  >
                    {t(UI.nav[link.key], locale)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="relative border-t border-white/10 bg-brand-black/40">
        <div className="container mx-auto flex flex-col items-center justify-between gap-3 px-4 py-4 text-xs leading-7 text-white/55 sm:flex-row sm:text-sm lg:px-8">
          <p>
            {companyName || title
              ? `© ${year} ${companyName || title} — ${t(UI.copyright, locale)}`
              : `© ${year} ${t(UI.copyright, locale)}`}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1">
            <Link to="/articles" className="transition-colors hover:text-brand-lime">
              {t(UI.nav.articles, locale)}
            </Link>
            <Link to="/contact" className="transition-colors hover:text-brand-lime">
              {t(UI.nav.contact, locale)}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
