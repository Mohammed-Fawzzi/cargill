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
} from "react-icons/io5";
import { RiMenu2Line } from "react-icons/ri";
import SiteLogo from "@/components/ui/SiteLogo";
import LanguageSwitch from "@/components/layout/LanguageSwitch";
import { useLocale } from "@/context/LocaleContext";
import { useSiteData } from "@/context/SiteDataContext";
import { getCategories } from "@/services/cms/products";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";
import { resolveCompanySocial } from "@/utils/social";

function linkClass({ isActive }) {
  return `inline-flex items-center gap-1 px-1 py-2 text-[15px] font-medium tracking-wide transition-colors duration-300 hover:text-brand-lime ${
    isActive ? "text-brand-lime" : "text-white"
  }`;
}

function CircleIcon({ children, href, label, className = "" }) {
  const classes = `inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/45 text-white transition-colors duration-300 hover:border-brand-lime hover:text-brand-lime ${className}`;
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
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.18 }}
            className="absolute start-1/2 top-full z-40 mt-1 min-w-[14rem] -translate-x-1/2 overflow-hidden border border-white/10 bg-brand-forest-deep py-2 shadow-[0_18px_40px_rgba(0,0,0,0.4)] rtl:translate-x-1/2"
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
      className="block px-4 py-2.5 text-sm font-medium text-white/85 transition-colors hover:bg-white/5 hover:text-brand-lime"
    >
      {children}
    </Link>
  );
}

export default function Navbar() {
  const { locale } = useLocale();
  const { contact } = useSiteData();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const companyName = t(contact?.companyName, locale);
  const phone = contact?.phones?.[0] || "";
  const email = contact?.emails?.[0] || "";
  const socials = resolveCompanySocial(contact?.social);
  const closeMenu = () => setIsMenuOpen(false);

  const categoriesQuery = useQuery({
    queryKey: ["cms", "categories"],
    queryFn: getCategories,
    staleTime: 1000 * 60 * 5,
  });
  const categories = categoriesQuery.data || [];

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
    <nav className="fixed inset-x-0 top-0 z-30 text-white">
      <div className="bg-brand-forest-deep">
        <div className="mx-auto flex min-h-[38px] max-w-[1400px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-10">
          <div className="hidden lg:block">
            <LanguageSwitch variant="menu" />
          </div>

          <div className="ms-auto flex flex-wrap items-center justify-end gap-x-3 gap-y-1 text-[12px] text-white/90 sm:gap-x-4 sm:text-[13px]">
            {phone ? (
              <a
                href={`tel:${phone.replace(/\s+/g, "")}`}
                className="inline-flex items-center gap-2 transition-colors duration-300 hover:text-brand-lime"
                dir="ltr"
              >
                <CircleIcon>
                  <IoCallOutline className="text-[13px]" aria-hidden="true" />
                </CircleIcon>
                <span>
                  {t(UI.phone, locale)}: {phone}
                </span>
              </a>
            ) : null}
            {email ? (
              <CircleIcon
                href={`mailto:${email}`}
                label={email}
                className="hidden sm:inline-flex"
              >
                <IoMailOutline className="text-[13px]" aria-hidden="true" />
              </CircleIcon>
            ) : null}
            {socials.map((platform) => (
              <CircleIcon
                key={platform.id}
                href={platform.url}
                label={platform.label}
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

      <div className="relative bg-brand-forest-deep">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
          <div className="relative z-10 hidden min-h-[70px] grid-cols-[1fr_220px_1fr] items-center gap-4 lg:grid">
            <ul className="flex items-center justify-end gap-x-8 xl:gap-x-11">
              <NavItem to="/" end label={t(UI.nav.home, locale)} />
              <NavItem to="/about" label={t(UI.nav.about, locale)} />
              <NavItem to="/products" label={t(UI.nav.products, locale)}>
                {productsMenu}
              </NavItem>
            </ul>

            <div className="relative flex h-[70px] items-center justify-center">
              <Link
                to="/"
                className="absolute top-2 z-20 flex h-[100px] w-[200px] items-center justify-center"
              >
                <SiteLogo
                  alt={companyName}
                  className="h-[68px] w-auto max-w-[170px] object-contain"
                />
              </Link>
            </div>

            <ul className="flex items-center justify-start gap-x-8 xl:gap-x-11">
              <NavItem to="/articles" label={t(UI.media, locale)}>
                {mediaMenu}
              </NavItem>
              <NavItem to="/events" label={t(UI.nav.events, locale)} />
              <NavItem to="/contact" label={t(UI.nav.contact, locale)} />
              <li>
                <Link
                  to="/products"
                  className="inline-flex items-center px-1 py-2 text-white transition-colors duration-300 hover:text-brand-lime"
                  aria-label={t(UI.searchProducts, locale)}
                >
                  <IoSearchOutline className="text-[20px]" aria-hidden="true" />
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex min-h-[68px] items-center justify-between gap-2 py-2 lg:hidden">
            <button
              type="button"
              onClick={() => setIsMenuOpen((open) => !open)}
              className="inline-flex h-10 w-10 cursor-pointer items-center justify-center text-white transition-colors hover:text-brand-lime"
              aria-label={isMenuOpen ? t(UI.closeMenu, locale) : t(UI.openMenu, locale)}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? (
                <IoClose className="text-2xl" />
              ) : (
                <RiMenu2Line className="text-2xl" />
              )}
            </button>

            <Link to="/" onClick={closeMenu} className="shrink-0">
              <SiteLogo
                alt={companyName}
                className="h-12 w-auto max-w-[140px] object-contain"
              />
            </Link>

            <div className="flex items-center gap-1">
              <Link
                to="/products"
                className="inline-flex h-10 w-10 items-center justify-center text-white"
                aria-label={t(UI.searchProducts, locale)}
              >
                <IoSearchOutline className="text-xl" aria-hidden="true" />
              </Link>
              <LanguageSwitch compact />
            </div>
          </div>

          <AnimatePresence>
            {isMenuOpen ? (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.28 }}
                className="overflow-hidden border-t border-white/10 lg:hidden"
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
          className="pointer-events-none absolute inset-x-0 top-[calc(100%-1px)] hidden h-[58px] w-full text-brand-forest-deep lg:block"
          viewBox="0 0 1440 58"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            fill="currentColor"
            d="M0 0h1440v1H878c-36 0-62 10-88 30-16 12-28 27-70 27s-54-15-70-27c-26-20-52-30-88-30H0V0z"
          />
        </svg>
      </div>
    </nav>
  );
}
