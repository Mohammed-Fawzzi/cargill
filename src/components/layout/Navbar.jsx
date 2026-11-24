import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  IoClose,
  IoMailOutline,
  IoSearchOutline,
  IoChevronDown,
  IoCallOutline,
  IoLogoWhatsapp,
} from "react-icons/io5";
import { RiMenu2Line } from "react-icons/ri";
import SiteLogo from "@/components/ui/SiteLogo";
import LanguageSwitch from "@/components/layout/LanguageSwitch";
import { useLocale } from "@/context/LocaleContext";
import { useSiteData } from "@/context/SiteDataContext";
import { getCategories } from "@/services/cms/products";
import { toTelHref, toWhatsAppHref } from "@/lib/phone";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";
import { resolveCompanySocial } from "@/utils/social";

function linkClass({ isActive }) {
  return `relative inline-flex items-center gap-1 px-1 py-2 text-[15px] font-semibold tracking-wide transition-colors duration-300 hover:text-brand-lime ${
    isActive ? "text-brand-lime" : "text-brand-ink"
  } after:pointer-events-none after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:origin-center after:rounded-full after:bg-brand-lime after:transition-transform after:duration-300 ${
    isActive ? "after:scale-x-100" : "after:scale-x-0 hover:after:scale-x-100"
  }`;
}

function CircleIcon({ children, href, label, className = "inline-flex" }) {
  const classes = `${className} h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/45 text-white transition-all duration-300 hover:border-brand-lime hover:bg-brand-lime hover:text-brand-ink`;
  if (!href) {
    return (
      <span className={classes} aria-hidden="true">
        {children}
      </span>
    );
  }
  const external = /^https?:/i.test(href);
  return (
    <a
      href={href}
      className={classes}
      aria-label={label}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </a>
  );
}

function NavItem({ to, end, label, children, onNavigate }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const hasMenu = Boolean(children);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  if (!hasMenu) {
    return (
      <li>
        <NavLink to={to} end={end} onClick={onNavigate} className={linkClass}>
          {label}
        </NavLink>
      </li>
    );
  }

  return (
    <li
      ref={rootRef}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <NavLink to={to} end={end} onClick={onNavigate} className={linkClass}>
        {label}
        <IoChevronDown
          className={`text-[11px] transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </NavLink>
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className="absolute start-1/2 top-full z-40 mt-1 min-w-[15rem] -translate-x-1/2 overflow-hidden rounded-b-md border border-brand-ink/10 bg-white py-2 shadow-[0_18px_40px_rgba(24,16,96,0.14)] rtl:translate-x-1/2"
          >
            {children}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </li>
  );
}

function DropdownLink({ to, children, onNavigate }) {
  return (
    <Link
      to={to}
      onClick={onNavigate}
      className="block px-4 py-2.5 text-sm font-medium text-brand-ink/80 transition-colors hover:bg-brand-lime/10 hover:text-brand-lime"
    >
      {children}
    </Link>
  );
}

export default function Navbar() {
  const { locale } = useLocale();
  const { contact } = useSiteData();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const companyName = t(contact?.companyName, locale);
  const phone = contact?.phones?.[0] || "";
  const email = contact?.emails?.[0] || "";
  const phoneHref = toTelHref(phone);
  const waHref = toWhatsAppHref(phone);
  const socials = resolveCompanySocial(contact?.social);
  const closeMenu = () => setIsMenuOpen(false);

  const categoriesQuery = useQuery({
    queryKey: ["cms", "categories"],
    queryFn: getCategories,
    staleTime: 1000 * 60 * 5,
  });
  const categories = categoriesQuery.data || [];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!isMenuOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") closeMenu();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isMenuOpen]);

  const productsMenu = (
    <>
      <DropdownLink to="/products" onNavigate={closeMenu}>
        {t(UI.viewAll, locale)}
      </DropdownLink>
      {categories.map((category) => (
        <DropdownLink
          key={category.id}
          to={`/products?section=${encodeURIComponent(category.id)}`}
          onNavigate={closeMenu}
        >
          {t(category.name, locale)}
        </DropdownLink>
      ))}
    </>
  );

  const mediaMenu = (
    <>
      <DropdownLink to="/articles" onNavigate={closeMenu}>
        {t(UI.nav.articles, locale)}
      </DropdownLink>
      <DropdownLink to="/events" onNavigate={closeMenu}>
        {t(UI.nav.events, locale)}
      </DropdownLink>
    </>
  );

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-30 transition-shadow duration-300 ${
        scrolled ? "shadow-[0_10px_30px_rgba(24,16,96,0.12)]" : ""
      }`}
    >
      <div className="bg-brand-forest-deep text-white">
        <div className="mx-auto flex min-h-[38px] max-w-[1400px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-10">
          <div className="hidden lg:block">
            <LanguageSwitch variant="menu" />
          </div>

          <div className="ms-auto flex flex-nowrap items-center justify-end gap-x-2 overflow-hidden text-[12px] text-white/90 sm:gap-x-4 sm:text-[13px]">
            {phoneHref ? (
              <a
                href={phoneHref}
                className="inline-flex max-w-full cursor-pointer items-center gap-2 transition-colors duration-300 hover:text-brand-lime"
                dir="ltr"
              >
                <CircleIcon>
                  <IoCallOutline className="text-[13px]" aria-hidden="true" />
                </CircleIcon>
                <span className="hidden truncate sm:inline">
                  {t(UI.phone, locale)}: {phone}
                </span>
              </a>
            ) : null}
            {waHref ? (
              <CircleIcon
                href={waHref}
                label={t(UI.whatsapp, locale)}
                className="hidden lg:inline-flex"
              >
                <IoLogoWhatsapp className="text-[13px]" aria-hidden="true" />
              </CircleIcon>
            ) : null}
            {email ? (
              <CircleIcon
                href={`mailto:${email}`}
                label={email}
                className="hidden lg:inline-flex"
              >
                <IoMailOutline className="text-[13px]" aria-hidden="true" />
              </CircleIcon>
            ) : null}
            {socials.map((platform) => (
              <CircleIcon
                key={platform.id}
                href={platform.url}
                label={platform.label}
                className="hidden lg:inline-flex"
              >
                {React.createElement(platform.Icon, {
                  className: "text-[11px]",
                  "aria-hidden": true,
                })}
              </CircleIcon>
            ))}
          </div>
        </div>
      </div>

      <div className="relative border-b border-brand-ink/5 bg-white">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
          <div className="relative z-10 hidden min-h-[76px] grid-cols-[1fr_auto_1fr] items-center gap-4 lg:grid">
            <ul className="flex items-center justify-end gap-x-8 xl:gap-x-11">
              <NavItem to="/" end label={t(UI.nav.home, locale)} />
              <NavItem to="/about" label={t(UI.nav.about, locale)} />
              <NavItem to="/products" label={t(UI.nav.products, locale)}>
                {productsMenu}
              </NavItem>
            </ul>

            <Link
              to="/"
              className="flex h-[76px] items-center justify-center px-3 transition-opacity duration-300 hover:opacity-90"
            >
              <SiteLogo
                alt={companyName}
                className="h-[52px] w-auto max-w-[210px] object-contain"
              />
            </Link>

            <ul className="flex items-center justify-start gap-x-8 xl:gap-x-11">
              <NavItem to="/articles" label={t(UI.media, locale)}>
                {mediaMenu}
              </NavItem>
              <NavItem to="/events" label={t(UI.nav.events, locale)} />
              <NavItem to="/contact" label={t(UI.nav.contact, locale)} />
              <li>
                <Link
                  to="/products"
                  className="inline-flex items-center px-1 py-2 text-brand-ink transition-colors duration-300 hover:text-brand-lime"
                  aria-label={t(UI.searchProducts, locale)}
                >
                  <IoSearchOutline className="text-[20px]" aria-hidden="true" />
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex min-h-[64px] items-center justify-between gap-3 py-2 lg:hidden">
            <button
              type="button"
              onClick={() => setIsMenuOpen((open) => !open)}
              className="inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center text-brand-ink transition-colors hover:text-brand-lime"
              aria-label={isMenuOpen ? t(UI.closeMenu, locale) : t(UI.openMenu, locale)}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? (
                <IoClose className="text-2xl" />
              ) : (
                <RiMenu2Line className="text-2xl" />
              )}
            </button>

            <Link to="/" onClick={closeMenu} className="min-w-0 flex-1 text-center">
              <SiteLogo
                alt={companyName}
                className="mx-auto h-9 w-auto max-w-[140px] object-contain sm:h-10 sm:max-w-[160px]"
              />
            </Link>

            <div className="flex w-[5.5rem] shrink-0 items-center justify-end gap-0.5 sm:w-auto sm:gap-1">
              <Link
                to="/products"
                className="inline-flex h-10 w-10 cursor-pointer items-center justify-center text-brand-ink"
                aria-label={t(UI.searchProducts, locale)}
              >
                <IoSearchOutline className="text-xl" aria-hidden="true" />
              </Link>
              <LanguageSwitch compact tone="light" />
            </div>
          </div>

          <AnimatePresence>
            {isMenuOpen ? (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.28 }}
                className="overflow-hidden border-t border-brand-ink/10 lg:hidden"
              >
                <ul className="flex flex-col gap-1 py-4 text-base">
                  <NavItem to="/" end label={t(UI.nav.home, locale)} onNavigate={closeMenu} />
                  <NavItem to="/about" label={t(UI.nav.about, locale)} onNavigate={closeMenu} />
                  <NavItem to="/products" label={t(UI.nav.products, locale)} onNavigate={closeMenu}>
                    {productsMenu}
                  </NavItem>
                  <NavItem to="/articles" label={t(UI.nav.articles, locale)} onNavigate={closeMenu} />
                  <NavItem to="/events" label={t(UI.nav.events, locale)} onNavigate={closeMenu} />
                  <NavItem to="/contact" label={t(UI.nav.contact, locale)} onNavigate={closeMenu} />
                </ul>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <svg
          className={`pointer-events-none absolute inset-x-0 top-[calc(100%-1px)] hidden h-[54px] w-full text-white transition-opacity duration-300 lg:block ${
            scrolled ? "opacity-0" : "opacity-100"
          }`}
          viewBox="0 0 1440 54"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            fill="currentColor"
            d="M0 0h1440v1H900c-40 0-70 10-98 30-16 12-30 23-74 23s-58-11-74-23C610 11 580 1 540 1H0V0z"
          />
        </svg>
      </div>
    </nav>
  );
}
