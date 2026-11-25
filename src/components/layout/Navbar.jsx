import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  IoClose,
  IoChevronDown,
  IoLogoWhatsapp,
  IoSearchOutline,
} from "react-icons/io5";
import { RiMenu2Line } from "react-icons/ri";
import SiteLogo from "@/components/ui/SiteLogo";
import SafeImage from "@/components/ui/SafeImage";
import { TriangleAccent } from "@/components/ui/TriangleMask";
import LanguageSwitch from "@/components/layout/LanguageSwitch";
import ThemeToggle from "@/components/layout/ThemeToggle";
import { useLocale } from "@/context/LocaleContext";
import { useSiteData } from "@/context/SiteDataContext";
import { getCategories, getProducts } from "@/services/cms/products";
import { toWhatsAppHref } from "@/lib/phone";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";
import { easeOut } from "@/lib/motion";

function linkClass(solid) {
  return ({ isActive }) =>
    `relative inline-flex items-center gap-1 whitespace-nowrap px-1 py-2 text-[15px] font-semibold tracking-wide transition-colors duration-300 ${
      solid
        ? isActive
          ? "text-ink"
          : "text-ink/75 hover:text-ink"
        : isActive
          ? "text-white"
          : "text-white/80 hover:text-white"
    }`;
}

function ActiveMark({ active }) {
  return (
    <span
      className={`pointer-events-none absolute inset-x-1 -bottom-0.5 h-px bg-brand-lime transition-opacity duration-300 ${
        active ? "opacity-100" : "opacity-0"
      }`}
      aria-hidden="true"
    />
  );
}

function AskAgronomistButton({ href, label, className = "", onClick }) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      className={`inline-flex min-h-10 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-brand-lime px-4 text-sm font-bold text-brand-navy transition-colors hover:bg-brand-lime-hover ${className}`}
    >
      <IoLogoWhatsapp className="text-lg shrink-0" aria-hidden="true" />
      <span className="whitespace-nowrap">{label}</span>
    </a>
  );
}

function ProductsMegaMenu({ categories = [], locale, onNavigate }) {
  const tiles = categories.slice(0, 4);

  return (
    <div
      className="absolute inset-x-0 top-full z-40 pt-3"
      style={{ visibility: "visible", pointerEvents: "auto" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 6, transitionEnd: { visibility: "hidden" } }}
        transition={{ duration: 0.2, ease: easeOut }}
        className="border border-line/12 bg-surface p-3 shadow-[0_18px_40px_rgba(10,8,32,0.45)] sm:p-4"
      >
        <div className="mb-3 flex items-end justify-between gap-3 border-b border-line/10 pb-3">
          <div>
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-ink/45">
              Categories
            </p>
            <p className="mt-1 text-sm font-bold text-ink">
              {t(UI.nav.products, locale)}
            </p>
          </div>
          <Link
            to="/products"
            onClick={onNavigate}
            className="text-xs font-bold text-ink/70 underline-offset-4 transition-colors hover:text-brand-lime hover:underline"
          >
            {t(UI.viewAll, locale)}
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4 lg:gap-3">
          {tiles.map((category, index) => {
            const name = t(category.name, locale);
            return (
              <Link
                key={category.id}
                to={`/products?section=${encodeURIComponent(category.id)}`}
                onClick={onNavigate}
                className="group relative aspect-[3/4] overflow-hidden border border-line/10 bg-brand-navy"
              >
                {category.imageUrl ? (
                  <SafeImage
                    src={category.imageUrl}
                    alt={name}
                    width={640}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#221a72] to-[#181060]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/90 via-brand-navy/25 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-3">
                  <p className="mb-1 font-mono text-[10px] font-medium tracking-[0.18em] text-brand-lime">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <p className="text-sm font-extrabold leading-snug text-white sm:text-base">
                    {name}
                  </p>
                  <span
                    className="mt-2 block h-px w-0 bg-brand-lime transition-[width] duration-300 group-hover:w-full"
                    aria-hidden="true"
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}

function MoreMenu({ locale, onNavigate }) {
  const items = [
    { to: "/events", label: t(UI.nav.events, locale) },
    { to: "/finder", label: t(UI.findSolution, locale) },
  ];

  return (
    <div className="absolute end-0 top-full z-40 pt-3">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 6, transitionEnd: { visibility: "hidden" } }}
        transition={{ duration: 0.2, ease: easeOut }}
        className="min-w-[11.5rem] border border-line/12 bg-surface py-2 shadow-[0_18px_40px_rgba(10,8,32,0.45)]"
      >
        {items.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className="block whitespace-nowrap px-4 py-2.5 text-[15px] font-semibold text-ink/80 transition-colors hover:bg-ink/5 hover:text-ink"
          >
            {item.label}
          </Link>
        ))}
      </motion.div>
    </div>
  );
}

function MoreNavItem({ label, solid, children }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const tone = solid
    ? open
      ? "text-ink"
      : "text-ink/75 hover:text-ink"
    : open
      ? "text-white"
      : "text-white/80 hover:text-white";

  return (
    <li
      ref={rootRef}
      className="relative xl:hidden"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className={`relative inline-flex items-center gap-1 whitespace-nowrap px-1 py-2 text-[15px] font-semibold tracking-wide transition-colors duration-300 ${tone}`}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {label}
        <IoChevronDown
          className={`text-[11px] transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
        <ActiveMark active={open} />
      </button>
      <AnimatePresence>
        {open ? (
          <div className="contents" style={{ visibility: "visible" }}>
            {React.Children.map(children, (child) =>
              React.isValidElement(child)
                ? React.cloneElement(child, {
                    onNavigate: () => setOpen(false),
                  })
                : child,
            )}
          </div>
        ) : null}
      </AnimatePresence>
    </li>
  );
}

function NavItem({ to, end, label, children, onNavigate, mega, solid, className = "" }) {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const lockRef = useRef(false);
  const hasMenu = Boolean(children);
  const classes = linkClass(solid);

  const closeMega = () => {
    setOpen(false);
    lockRef.current = true;
    window.setTimeout(() => {
      lockRef.current = false;
    }, 400);
    onNavigate?.();
  };

  useEffect(() => {
    setOpen(false);
    lockRef.current = true;
    const timer = window.setTimeout(() => {
      lockRef.current = false;
    }, 400);
    return () => window.clearTimeout(timer);
  }, [location.pathname, location.search]);

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
      <li className={className}>
        <NavLink to={to} end={end} onClick={onNavigate} className={classes}>
          {({ isActive }) => (
            <>
              {label}
              <ActiveMark active={isActive} />
            </>
          )}
        </NavLink>
      </li>
    );
  }

  const menu = hasMenu
    ? React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child, { onNavigate: closeMega })
          : child,
      )
    : null;

  return (
    <li
      ref={rootRef}
      className={`${mega ? "static" : "relative"} ${className}`.trim()}
      onMouseEnter={() => {
        if (!lockRef.current) setOpen(true);
      }}
      onMouseLeave={() => setOpen(false)}
    >
      <NavLink
        to={to}
        end={end}
        onClick={closeMega}
        className={classes}
        aria-expanded={open}
      >
        {({ isActive }) => (
          <>
            {label}
            <IoChevronDown
              className={`text-[11px] transition-transform duration-300 ${open ? "rotate-180" : ""}`}
              aria-hidden="true"
            />
            <ActiveMark active={isActive || open} />
          </>
        )}
      </NavLink>
      <AnimatePresence>
        {open ? (
          <div className="contents" style={{ visibility: "visible" }}>
            {menu}
          </div>
        ) : null}
      </AnimatePresence>
    </li>
  );
}

export default function Navbar() {
  const { locale } = useLocale();
  const { contact } = useSiteData();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const companyName = t(contact?.companyName, locale);
  const phone = contact?.phones?.[0] || "";
  const askLabel = t(UI.askAgronomist, locale);
  const askMessage = t(UI.askAgronomistMessage, locale);
  const waHref = toWhatsAppHref(phone, askMessage);
  const closeMenu = () => setIsMenuOpen(false);

  const categoriesQuery = useQuery({
    queryKey: ["cms", "categories"],
    queryFn: getCategories,
    staleTime: 1000 * 60 * 5,
  });
  const productsQuery = useQuery({
    queryKey: ["cms", "products"],
    queryFn: getProducts,
    staleTime: 1000 * 60 * 5,
  });

  const categories = useMemo(() => {
    const list = categoriesQuery.data || [];
    const products = productsQuery.data || [];
    return list.map((category) => {
      const cover = products.find(
        (product) => product.sectionId === category.id && product.imageUrl,
      );
      return {
        ...category,
        imageUrl: cover?.imageUrl || "",
      };
    });
  }, [categoriesQuery.data, productsQuery.data]);

  useEffect(() => {
    closeMenu();
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (!isMenuOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") closeMenu();
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isMenuOpen]);

  const navLinks = [
    { to: "/", end: true, label: t(UI.nav.home, locale) },
    { to: "/about", label: t(UI.nav.about, locale) },
    { to: "/products", label: t(UI.nav.products, locale), mega: true },
    { to: "/articles", label: t(UI.nav.articles, locale) },
    { to: "/events", label: t(UI.nav.events, locale), compactHide: true },
    { to: "/contact", label: t(UI.nav.contact, locale) },
  ];

  return (
    <>
      <nav className="pointer-events-none relative z-40 px-4 pt-3 sm:px-5 sm:pt-4 lg:px-6">
        <div className="pointer-events-auto relative mx-auto flex h-16 max-w-[1180px] items-center justify-between gap-3 overflow-visible rounded-full nav-glass px-3 sm:h-[4.25rem] sm:px-5">
          <div className="order-3 flex shrink-0 items-center gap-1.5 sm:gap-2">
            <Link
              to="/finder"
              onClick={closeMenu}
              className="hidden min-h-10 items-center whitespace-nowrap px-2 text-xs font-bold text-ink/75 underline-offset-4 transition-colors hover:text-brand-lime hover:underline xl:inline-flex"
            >
              {t(UI.findSolution, locale)}
            </Link>
            <div className="hidden lg:block">
              <AskAgronomistButton href={waHref} label={askLabel} />
            </div>
            <ThemeToggle />
            <LanguageSwitch variant="toggle" tone="light" />
            <Link
              to="/products"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-ink transition-colors hover:bg-ink/5"
              aria-label={t(UI.searchProducts, locale)}
            >
              <IoSearchOutline className="text-xl" aria-hidden="true" />
            </Link>
            <button
              type="button"
              onClick={() => setIsMenuOpen((open) => !open)}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ink transition-colors hover:bg-ink/5 lg:hidden"
              aria-label={isMenuOpen ? t(UI.closeMenu, locale) : t(UI.openMenu, locale)}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? (
                <IoClose className="text-2xl" />
              ) : (
                <RiMenu2Line className="text-2xl" />
              )}
            </button>
          </div>

          <ul className="order-2 hidden items-center justify-center gap-x-[22px] lg:flex">
            {navLinks.map((item) =>
              item.mega ? (
                <NavItem
                  key={item.to}
                  to={item.to}
                  label={item.label}
                  mega
                  solid
                  onNavigate={closeMenu}
                >
                  <ProductsMegaMenu
                    categories={categories}
                    locale={locale}
                    onNavigate={closeMenu}
                  />
                </NavItem>
              ) : (
                <NavItem
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  label={item.label}
                  solid
                  onNavigate={closeMenu}
                  className={item.compactHide ? "hidden xl:block" : undefined}
                />
              ),
            )}
            <MoreNavItem label={t(UI.nav.more, locale)} solid>
              <MoreMenu locale={locale} onNavigate={closeMenu} />
            </MoreNavItem>
          </ul>

          <Link
            to="/"
            onClick={closeMenu}
            className="order-1 flex shrink-0 items-center justify-center px-1"
          >
            <SiteLogo
              alt={companyName}
              className="h-11 w-auto max-w-[9.5rem] object-contain object-right sm:h-12 sm:max-w-[11rem]"
            />
          </Link>
        </div>
      </nav>

      <AnimatePresence>
        {isMenuOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transitionEnd: { visibility: "hidden" } }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-30 bg-brand-navy lg:hidden"
            style={{ visibility: "visible", pointerEvents: "auto" }}
          >
            <div className="flex h-full flex-col px-6 pb-8 pt-[calc(var(--ticker-height)+6rem)]">
              <div className="mb-8 flex items-center justify-between border-b border-white/10 pb-4">
                <p className="font-mono text-[10px] font-medium uppercase tracking-[0.24em] text-brand-lime">
                  Menu
                </p>
                <div className="flex items-center gap-2">
                  <ThemeToggle className="text-white hover:bg-white/10" />
                  <LanguageSwitch variant="toggle" tone="dark" />
                </div>
              </div>

              <ul className="flex flex-1 flex-col justify-center gap-1">
                {navLinks.map((item, index) => (
                  <motion.li
                    key={item.to}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.32,
                      ease: easeOut,
                      delay: 0.04 + index * 0.05,
                    }}
                  >
                    <NavLink
                      to={item.to}
                      end={item.end}
                      onClick={closeMenu}
                      className={({ isActive }) =>
                        `block border-b border-white/10 py-3 text-3xl font-extrabold tracking-tight sm:text-4xl ${
                          isActive ? "text-brand-lime" : "text-white"
                        }`
                      }
                    >
                      <span className="inline-flex items-baseline gap-3">
                        <span className="text-xs font-bold tracking-[0.18em] text-brand-lime/80">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        {item.label}
                      </span>
                    </NavLink>
                    {item.mega && categories.length ? (
                      <div className="flex flex-wrap gap-2 pb-3 pt-2">
                        {categories.slice(0, 4).map((category) => (
                          <Link
                            key={category.id}
                            to={`/products?section=${encodeURIComponent(category.id)}`}
                            onClick={closeMenu}
                            className="border border-white/15 px-3 py-1.5 text-sm font-semibold text-white/85 transition-colors hover:border-brand-lime hover:text-brand-lime"
                          >
                            {t(category.name, locale)}
                          </Link>
                        ))}
                      </div>
                    ) : null}
                  </motion.li>
                ))}
              </ul>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: easeOut, delay: 0.34 }}
                className="mt-auto"
              >
                <AskAgronomistButton
                  href={waHref}
                  label={askLabel}
                  className="min-h-12 w-full text-base"
                  onClick={closeMenu}
                />
              </motion.div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
