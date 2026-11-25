import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, useInView } from "framer-motion";
import SiteLogo from "@/components/ui/SiteLogo";
import { NAV_LINKS } from "@constants/navLinks";
import { useLocale } from "@/context/LocaleContext";
import { useSiteData } from "@/context/SiteDataContext";
import { getCategories } from "@/services/cms/products";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";
import { resolveCompanySocial } from "@/utils/social";
import { toMapLink } from "@/lib/map";
import useMotionPrefs from "@/hooks/useMotionPrefs";
import LtrText from "@/components/ui/LtrText";
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
    () => (categoriesQuery.data || []).slice(0, 4),
    [categoriesQuery.data],
  );

  const brandWord =
    (companyName || title || "كارجيل").split(/\s+/)[0] || "كارجيل";

  return (
    <footer className="relative bg-brand-forest-deep text-white" aria-label="footer">
      <div className="relative container mx-auto px-4 pt-14 lg:px-8 lg:pt-16">
        <div className="mb-12 flex flex-col gap-6 border-b border-white/15 pb-10 lg:flex-row lg:items-end lg:justify-between">
          <p className="order-2 max-w-xl text-sm leading-7 text-white/70 lg:order-1 lg:text-base">
            {description || title || ""}
          </p>
          <Link to="/" className="order-1 shrink-0 lg:order-2">
            <SiteLogo
              variant="white"
              alt={companyName || title}
              className="h-11 w-auto max-w-[190px] object-contain"
            />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-10 pb-12 md:grid-cols-3 md:gap-0">
          <div className="md:border-e md:border-white/15 md:pe-8">
            <h3 className="mb-5 text-[11px] font-bold tracking-[0.18em] text-brand-lime">
              {t(UI.usefulLinks, locale)}
            </h3>
            <ul className="space-y-2.5">
              {NAV_LINKS.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm leading-7 text-white/80 transition-colors hover:text-brand-lime"
                  >
                    {t(UI.nav[link.key], locale)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:border-e md:border-white/15 md:px-8">
            <h3 className="mb-5 text-[11px] font-bold tracking-[0.18em] text-brand-lime">
              {t(UI.nav.products, locale)}
            </h3>
            <ul className="space-y-2.5">
              {categories.map((category) => (
                <li key={category.id}>
                  <Link
                    to={`/products?section=${encodeURIComponent(category.id)}`}
                    className="text-sm leading-7 text-white/80 transition-colors hover:text-brand-lime"
                  >
                    {t(category.name, locale)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:ps-8">
            <h3 className="mb-5 text-[11px] font-bold tracking-[0.18em] text-brand-lime">
              {t(UI.contactLabel, locale)}
            </h3>
            <ul className="space-y-3 text-sm leading-7 text-white/80">
              {phones.map((phone) => (
                <li key={phone}>
                  <a
                    href={`tel:${phone.replace(/\s+/g, "")}`}
                    className="transition-colors hover:text-brand-lime"
                  >
                    <LtrText>{phone}</LtrText>
                  </a>
                </li>
              ))}
              {emails.map((email) => (
                <li key={email}>
                  <a
                    href={`mailto:${email}`}
                    className="transition-colors hover:text-brand-lime"
                  >
                    {email}
                  </a>
                </li>
              ))}
              {address ? (
                <li>
                  <a
                    href={mapLink || undefined}
                    className="transition-colors hover:text-brand-lime"
                  >
                    {address}
                  </a>
                </li>
              ) : null}
            </ul>
          </div>
        </div>

        {socials.length > 0 ? (
          <div className="mb-10 flex flex-wrap gap-x-4 gap-y-2 text-sm font-semibold">
            {socials.map((link, index) => (
              <React.Fragment key={link.id}>
                {index > 0 ? (
                  <span className="text-white/25" aria-hidden="true">
                    ·
                  </span>
                ) : null}
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/80 transition-colors hover:text-brand-lime"
                >
                  {link.label}
                </a>
              </React.Fragment>
            ))}
          </div>
        ) : null}
      </div>

      <div className="relative border-t border-white/15">
        <div className="container mx-auto flex flex-col items-start justify-between gap-3 px-4 py-4 text-xs leading-7 text-white/55 sm:flex-row sm:items-center sm:text-sm lg:px-8">
          <p>
            {companyName || title
              ? `© ${year} ${companyName || title} — ${t(UI.copyright, locale)}`
              : `© ${year} ${t(UI.copyright, locale)}`}
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
            <Link to="/articles" className="transition-colors hover:text-brand-lime">
              {t(UI.nav.articles, locale)}
            </Link>
            <Link to="/contact" className="transition-colors hover:text-brand-lime">
              {t(UI.nav.contact, locale)}
            </Link>
          </div>
        </div>
      </div>

      <div
        ref={brandRef}
        className="text-clip-safe pointer-events-none relative px-4 pb-20 pt-2 text-center text-[clamp(3.5rem,12vw,9rem)] font-extrabold leading-[1.15] tracking-tight text-white/[0.06] md:pb-8 lg:px-8"
        aria-hidden="true"
      >
        <BrandWordReveal
          word={brandWord}
          active={brandInView}
          reducedMotion={reducedMotion}
        />
      </div>
    </footer>
  );
}
