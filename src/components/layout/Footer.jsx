import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, useInView } from "framer-motion";
import SiteLogo from "@/components/ui/SiteLogo";
import LtrText from "@/components/ui/LtrText";
import { NAV_LINKS } from "@constants/navLinks";
import { useLocale } from "@/context/LocaleContext";
import { useSiteData } from "@/context/SiteDataContext";
import { getCategories } from "@/services/cms/products";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";
import { resolveCompanySocial } from "@/utils/social";
import { toMapLink } from "@/lib/map";
import useMotionPrefs from "@/hooks/useMotionPrefs";
import { easeOut } from "@/lib/motion";

function BrandWordReveal({ word, active, reducedMotion }) {
  const letters = useMemo(() => Array.from(word || ""), [word]);
  const [joined, setJoined] = useState(Boolean(reducedMotion));

  useEffect(() => {
    if (reducedMotion) {
      setJoined(true);
      return undefined;
    }
    if (!active) {
      setJoined(false);
      return undefined;
    }
    const totalMs = 450 + Math.max(0, letters.length - 1) * 45 + 60;
    const timer = window.setTimeout(() => setJoined(true), totalMs);
    return () => window.clearTimeout(timer);
  }, [active, reducedMotion, letters.length, word]);

  return (
    <span className="relative inline-block">
      <span className={joined ? "opacity-100" : "opacity-0"}>{word}</span>
      {!joined ? (
        <span className="absolute inset-x-0 top-0 text-center">
          {letters.map((letter, index) => (
            <motion.span
              key={`${letter}-${index}`}
              className="inline-block"
              initial={{ opacity: 0, y: 20 }}
              animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{
                duration: 0.45,
                delay: index * 0.045,
                ease: easeOut,
              }}
            >
              {letter === " " ? "\u00A0" : letter}
            </motion.span>
          ))}
        </span>
      ) : null}
    </span>
  );
}

export default function Footer() {
  const { locale } = useLocale();
  const { reducedMotion } = useMotionPrefs();
  const brandRef = useRef(null);
  const brandInView = useInView(brandRef, { once: true, amount: 0.4 });
  const { contact, footer } = useSiteData();
  const companyName = t(contact?.companyName, locale);
  const description = t(footer?.body, locale) || t(contact?.about, locale);
  const title = t(footer?.title, locale);
  const address = t(contact?.address, locale);
  const phones = contact?.phones || [];
  const emails = contact?.emails || [];
  const socials = resolveCompanySocial(contact?.social);
  const mapLink = toMapLink(address || contact?.mapUrl);
  const year = new Date().getFullYear();

  const categoriesQuery = useQuery({
    queryKey: ["cms", "categories"],
    queryFn: getCategories,
    staleTime: 1000 * 60 * 5,
  });

  const categories = useMemo(
    () => (categoriesQuery.data || []).slice(0, 5),
    [categoriesQuery.data],
  );

  const brandWord =
    (companyName || title || "كارجيل").split(/\s+/)[0] || "كارجيل";

  return (
    <footer
      className="relative border-t border-white/8 bg-[#070517] pt-16 pb-10 text-sm text-white"
      aria-label="footer"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-10 border-b border-white/8 pb-12 md:grid-cols-2 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-4">
            <Link to="/" className="inline-flex" dir="ltr">
              <SiteLogo
                variant="white"
                alt={companyName || title}
                className="h-10 w-auto max-w-[180px] object-contain"
              />
            </Link>
            {description ? (
              <p className="max-w-sm text-xs leading-relaxed text-white/45">
                {description}
              </p>
            ) : null}
            {address ? (
              <p className="text-[11px] leading-relaxed text-white/55">
                <span className="text-brand-lime">
                  {t(UI.address, locale)}:
                </span>{" "}
                <a
                  href={mapLink || undefined}
                  className="transition-colors hover:text-white"
                >
                  {address}
                </a>
              </p>
            ) : null}
          </div>

          <div className="space-y-3 lg:col-span-2">
            <h4 className="text-xs font-medium tracking-wide text-brand-lime">
              {t(UI.usefulLinks, locale)}
            </h4>
            <ul className="space-y-2 text-xs">
              {NAV_LINKS.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="ix-link ix-footer-link">
                    {t(UI.nav[link.key], locale)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {categories.length > 0 ? (
            <div className="space-y-3 lg:col-span-2">
              <h4 className="text-xs font-medium tracking-wide text-brand-lime">
                {t(UI.nav.products, locale)}
              </h4>
              <ul className="space-y-2 text-xs">
                {categories.map((category) => (
                  <li key={category.id}>
                    <Link
                      to={`/products?section=${encodeURIComponent(category.id)}`}
                      className="ix-link ix-footer-link"
                    >
                      {t(category.name, locale)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="space-y-3 lg:col-span-4">
            <h4 className="text-xs font-medium tracking-wide text-brand-lime">
              {t(UI.contactLabel, locale)}
            </h4>
            <div className="space-y-2 text-xs text-white/55">
              {phones.map((phone) => (
                <div key={phone} className="flex flex-wrap items-center gap-2">
                  <span className="text-brand-lime">
                    {t(UI.phone, locale)}:
                  </span>
                  <a
                    href={`tel:${phone.replace(/\s+/g, "")}`}
                    className="ix-link ix-footer-link"
                  >
                    <LtrText>{phone}</LtrText>
                  </a>
                </div>
              ))}
              {emails.map((email) => (
                <div key={email} className="flex flex-wrap items-center gap-2">
                  <span className="text-brand-lime">
                    {t(UI.email, locale)}:
                  </span>
                  <a
                    href={`mailto:${email}`}
                    className="ix-link ix-footer-link font-mono"
                    dir="ltr"
                  >
                    {email}
                  </a>
                </div>
              ))}
            </div>
            {socials.length > 0 ? (
              <div className="flex flex-wrap gap-x-4 gap-y-2 pt-2 text-xs font-medium">
                {socials.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ix-link ix-footer-link"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col items-start justify-between gap-4 pt-6 text-xs text-white/40 sm:flex-row sm:items-center">
          <p>
            {companyName || title
              ? `© ${year} ${companyName || title} — ${t(UI.copyright, locale)}`
              : `© ${year} ${t(UI.copyright, locale)}`}
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link to="/articles" className="ix-link ix-footer-link">
              {t(UI.nav.articles, locale)}
            </Link>
            <Link to="/contact" className="ix-link ix-footer-link">
              {t(UI.nav.contact, locale)}
            </Link>
          </div>
        </div>

        <div
          ref={brandRef}
          className="text-clip-safe pointer-events-none relative px-2 pb-4 pt-10 text-center text-[clamp(3rem,10vw,7rem)] font-extrabold leading-[1.15] tracking-tight text-white/[0.04]"
          aria-hidden="true"
        >
          <BrandWordReveal
            word={brandWord}
            active={brandInView}
            reducedMotion={reducedMotion}
          />
        </div>
      </div>
    </footer>
  );
}
