import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, useInView } from "framer-motion";
import SiteLogo from "@/components/ui/SiteLogo";
import RollLink from "@/components/ui/RollLink";
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

function FooterColumn({ children, delay = 0, active, reducedMotion, className = "" }) {
  return (
    <motion.div
      className={className}
      initial={reducedMotion ? false : { opacity: 0, y: 14 }}
      animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
      transition={{ duration: 0.4, ease: easeOut, delay: reducedMotion ? 0 : delay }}
    >
      {children}
    </motion.div>
  );
}

function FooterLink({ to, href, children, delay = 0, active, reducedMotion, className = "", dir }) {
  const motionProps = {
    initial: reducedMotion ? false : { opacity: 0, y: 10 },
    animate: active ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 },
    transition: {
      duration: 0.35,
      ease: easeOut,
      delay: reducedMotion ? 0 : delay,
    },
  };

  if (to) {
    return (
      <motion.li {...motionProps}>
        <RollLink to={to} className={className} dir={dir}>
          {children}
        </RollLink>
      </motion.li>
    );
  }

  return (
    <motion.div {...motionProps} className={className}>
      <RollLink href={href} dir={dir}>
        {children}
      </RollLink>
    </motion.div>
  );
}

export default function Footer() {
  const { locale } = useLocale();
  const { reducedMotion } = useMotionPrefs();
  const brandRef = useRef(null);
  const rootRef = useRef(null);
  const brandInView = useInView(brandRef, { once: true, amount: 0.4 });
  const footerInView = useInView(rootRef, { once: true, amount: 0.18 });
  const active = reducedMotion || footerInView;
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

  let linkStep = 0;
  const nextDelay = () => {
    const value = 0.08 + linkStep * 0.04;
    linkStep += 1;
    return value;
  };

  return (
    <footer
      ref={rootRef}
      data-home-bg="#0A0820"
      className="relative border-t border-white/8 bg-transparent pt-16 pb-10 text-sm text-white"
      aria-label="footer"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-10 border-b border-white/8 pb-12 md:grid-cols-2 lg:grid-cols-12">
          <FooterColumn
            className="space-y-4 lg:col-span-4"
            delay={0}
            active={active}
            reducedMotion={reducedMotion}
          >
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
                <RollLink href={mapLink || undefined}>{address}</RollLink>
              </p>
            ) : null}
          </FooterColumn>

          <FooterColumn
            className="space-y-3 lg:col-span-2"
            delay={0.04}
            active={active}
            reducedMotion={reducedMotion}
          >
            <h4 className="text-xs font-medium tracking-wide text-brand-lime">
              {t(UI.usefulLinks, locale)}
            </h4>
            <ul className="space-y-2 text-xs">
              {NAV_LINKS.map((link) => (
                <FooterLink
                  key={link.path}
                  to={link.path}
                  delay={nextDelay()}
                  active={active}
                  reducedMotion={reducedMotion}
                >
                  {t(UI.nav[link.key], locale)}
                </FooterLink>
              ))}
            </ul>
          </FooterColumn>

          {categories.length > 0 ? (
            <FooterColumn
              className="space-y-3 lg:col-span-2"
              delay={0.08}
              active={active}
              reducedMotion={reducedMotion}
            >
              <h4 className="text-xs font-medium tracking-wide text-brand-lime">
                {t(UI.nav.products, locale)}
              </h4>
              <ul className="space-y-2 text-xs">
                {categories.map((category) => (
                  <FooterLink
                    key={category.id}
                    to={`/products?section=${encodeURIComponent(category.id)}`}
                    delay={nextDelay()}
                    active={active}
                    reducedMotion={reducedMotion}
                  >
                    {t(category.name, locale)}
                  </FooterLink>
                ))}
              </ul>
            </FooterColumn>
          ) : null}

          <FooterColumn
            className="space-y-3 lg:col-span-4"
            delay={0.12}
            active={active}
            reducedMotion={reducedMotion}
          >
            <h4 className="text-xs font-medium tracking-wide text-brand-lime">
              {t(UI.contactLabel, locale)}
            </h4>
            <div className="space-y-2 text-xs">
              {phones.map((phone) => (
                <motion.div
                  key={phone}
                  className="flex flex-wrap items-center gap-2"
                  initial={reducedMotion ? false : { opacity: 0, y: 10 }}
                  animate={
                    active ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }
                  }
                  transition={{
                    duration: 0.35,
                    ease: easeOut,
                    delay: reducedMotion ? 0 : nextDelay(),
                  }}
                >
                  <span className="text-brand-lime">
                    {t(UI.phone, locale)}:
                  </span>
                  <RollLink
                    href={`tel:${phone.replace(/\s+/g, "")}`}
                    dir="ltr"
                  >
                    {phone}
                  </RollLink>
                </motion.div>
              ))}
              {emails.map((email) => (
                <motion.div
                  key={email}
                  className="flex flex-wrap items-center gap-2"
                  initial={reducedMotion ? false : { opacity: 0, y: 10 }}
                  animate={
                    active ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }
                  }
                  transition={{
                    duration: 0.35,
                    ease: easeOut,
                    delay: reducedMotion ? 0 : nextDelay(),
                  }}
                >
                  <span className="text-brand-lime">
                    {t(UI.email, locale)}:
                  </span>
                  <RollLink
                    href={`mailto:${email}`}
                    className="max-w-full break-all font-mono"
                    dir="ltr"
                  >
                    {email}
                  </RollLink>
                </motion.div>
              ))}
            </div>
            {socials.length > 0 ? (
              <div className="flex flex-wrap gap-x-4 gap-y-2 pt-2 text-xs font-medium">
                {socials.map((link) => (
                  <motion.div
                    key={link.id}
                    initial={reducedMotion ? false : { opacity: 0, y: 10 }}
                    animate={
                      active ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }
                    }
                    transition={{
                      duration: 0.35,
                      ease: easeOut,
                      delay: reducedMotion ? 0 : nextDelay(),
                    }}
                  >
                    <RollLink
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {link.label}
                    </RollLink>
                  </motion.div>
                ))}
              </div>
            ) : null}
          </FooterColumn>
        </div>

        <div className="flex flex-col items-start justify-between gap-4 pt-6 text-xs text-white/40 sm:flex-row sm:items-center">
          <p>
            {companyName || title
              ? `© ${year} ${companyName || title} — ${t(UI.copyright, locale)}`
              : `© ${year} ${t(UI.copyright, locale)}`}
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <RollLink to="/articles">{t(UI.nav.articles, locale)}</RollLink>
            <RollLink to="/contact">{t(UI.nav.contact, locale)}</RollLink>
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
