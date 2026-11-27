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
import SplitArrowButton from "@/components/ui/SplitArrowButton";
import LanguageSwitch from "@/components/layout/LanguageSwitch";
import FullscreenMenu from "@/components/layout/FullscreenMenu";
import { useLocale } from "@/context/LocaleContext";
import { useSiteData } from "@/context/SiteDataContext";
import { getCategories, getProducts } from "@/services/cms/products";
import { toWhatsAppHref } from "@/lib/phone";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";
import { easeOut } from "@/lib/motion";

function linkClass(solid) {
  return ({ isActive }) =>
    `ix-link relative inline-flex items-center gap-1 whitespace-nowrap px-0.5 py-2 text-[13px] font-semibold tracking-wide transition-colors duration-300 xl:px-1 xl:text-[15px] ${
      isActive ? "is-active" : ""
    } ${
      solid
        ? isActive
          ? "text-ink"
          : "text-ink/75 hover:text-ink"
        : isActive
          ? "text-white"
          : "text-white/80 hover:text-white"
    }`;
}

function AskAgronomistButton({ href, label, className = "", onClick }) {
  if (!href) return null;
  return (
    <SplitArrowButton
      href={href}
      onClick={onClick}
      variant="primary"
      className={`min-h-10 ${className}`.trim()}
    >
      <IoLogoWhatsapp className="text-lg shrink-0" aria-hidden="true" />
      <span className="whitespace-nowrap">{label}</span>
    </SplitArrowButton>
  );
}

function ProductsMegaMenu({ tiles = [], locale, onNavigate }) {
  const list = tiles.slice(0, 4);
  const cols =
    list.length >= 4
      ? "grid-cols-2 lg:grid-cols-4"
      : list.length === 3
        ? "grid-cols-2 lg:grid-cols-3"
        : list.length === 2
          ? "grid-cols-2"
          : "grid-cols-1";

  return (
    <div
      className="absolute inset-x-0 top-full z-40 flex justify-center pt-2"
      style={{ visibility: "visible", pointerEvents: "auto" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 6, transitionEnd: { visibility: "hidden" } }}
        transition={{ duration: 0.2, ease: easeOut }}
        className="w-full max-w-[34rem] border border-line/12 bg-surface p-2.5 shadow-[0_18px_40px_rgba(10,8,32,0.45)] sm:p-3"
      >
        <div className="mb-2 flex items-end justify-between gap-3 border-b border-line/10 pb-2">
          <div>
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-ink/45">
              {t(UI.featuredLabel, locale)}
            </p>
            <p className="mt-0.5 text-sm font-bold text-ink">
              {t(UI.nav.products, locale)}
            </p>
          </div>
          <Link
            to="/products"
            onClick={onNavigate}
            className="ix-link text-xs font-bold text-ink/70"
          >
            {t(UI.viewAll, locale)}
          </Link>
        </div>
        <div className={`grid gap-2 ${cols}`}>
          {list.map((tile, index) => {
            const name = t(tile.name, locale);
            const categoryName = t(tile.categoryName, locale);
            return (
              <Link
                key={tile.id}
                to={`/products/${encodeURIComponent(tile.id)}`}
                onClick={onNavigate}
                className="group relative aspect-[5/4] overflow-hidden border border-line/10 bg-brand-navy"
              >
                {tile.imageUrl ? (
                  <SafeImage
                    src={tile.imageUrl}
                    alt={name}
                    width={480}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#221a72] to-[#181060]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/90 via-brand-navy/25 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-2.5">
                  <p className="mb-0.5 font-mono text-[10px] font-medium tracking-[0.18em] text-brand-lime">
                    {String(index + 1).padStart(2, "0")}
                    {categoryName ? ` · ${categoryName}` : ""}
                  </p>
                  <p className="text-[13px] font-extrabold leading-snug text-white sm:text-sm">
                    {name}
                  </p>
                  <span
                    className="mt-1.5 block h-px w-0 bg-brand-lime transition-[width] duration-300 group-hover:w-full"
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
    { to: "/contact", label: t(UI.nav.contact, locale) },
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
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className={`relative inline-flex items-center gap-1 whitespace-nowrap px-0.5 py-2 text-[13px] font-semibold tracking-wide transition-colors duration-300 xl:px-1 xl:text-[15px] ${tone}`}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {label}
        <IoChevronDown
          className={`text-[11px] transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
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
              <span className="sr-only">{isActive ? "active" : ""}</span>
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
        {() => (
          <>
            {label}
            <IoChevronDown
              className={`text-[11px] transition-transform duration-300 ${open ? "rotate-180" : ""}`}
              aria-hidden="true"
            />
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
  const [menuOrigin, setMenuOrigin] = useState({ x: 0, y: 0 });
  const [scrolled, setScrolled] = useState(false);
  const [mobileCapsule, setMobileCapsule] = useState(false);
  const lastScrollY = useRef(0);
  const menuBtnRef = useRef(null);
  const capsuleBtnRef = useRef(null);
  const [isWide, setIsWide] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(min-width: 1536px)").matches
      : true,
  );
  const companyName = t(contact?.companyName, locale);
  const phone = contact?.phones?.[0] || "";
  const askLabel = t(UI.askAgronomist, locale);
  const askMessage = t(UI.askAgronomistMessage, locale);
  const waHref = toWhatsAppHref(phone, askMessage);
  const closeMenu = () => setIsMenuOpen(false);

  const openMenuFrom = (node) => {
    if (node) {
      const rect = node.getBoundingClientRect();
      setMenuOrigin({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
    }
    setIsMenuOpen(true);
  };

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

  const megaProducts = useMemo(() => {
    const categories = categoriesQuery.data || [];
    const products = productsQuery.data || [];
    return categories
      .filter((category) => {
        const ar = String(category?.name?.ar || "").toLowerCase();
        const en = String(category?.name?.en || "").toLowerCase();
        const id = String(category?.id || "").toLowerCase();
        return (
          !ar.includes("بذور") && !en.includes("seed") && !id.includes("seed")
        );
      })
      .map((category) => {
        const cover =
          products.find(
            (product) =>
              product.sectionId === category.id &&
              (product.imageUrl || product.videoUrl),
          ) || products.find((product) => product.sectionId === category.id);
        if (!cover?.id) return null;
        return {
          id: cover.id,
          name: cover.name,
          imageUrl: cover.imageUrl || category.imageUrl || "",
          categoryName: category.name,
        };
      })
      .filter(Boolean)
      .slice(0, 4);
  }, [categoriesQuery.data, productsQuery.data]);

  useEffect(() => {
    closeMenu();
  }, [location.pathname, location.search]);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 80);
      const isMobile = window.innerWidth < 768;
      if (!isMobile) {
        setMobileCapsule(false);
        lastScrollY.current = y;
        return;
      }
      if (y < 200) {
        setMobileCapsule(false);
      } else if (y > lastScrollY.current + 4) {
        setMobileCapsule(true);
      } else if (y < lastScrollY.current - 4) {
        setMobileCapsule(false);
      }
      lastScrollY.current = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    const wide = window.matchMedia("(min-width: 1536px)");
    const onWide = (event) => setIsWide(event.matches);
    setIsWide(wide.matches);
    wide.addEventListener("change", onWide);
    return () => {
      wide.removeEventListener("change", onWide);
    };
  }, []);

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
    { to: "/contact", label: t(UI.nav.contact, locale), compactHide: true },
  ];

  const desktopLinks = navLinks.filter(
    (item) => isWide || !item.compactHide,
  );

  const menuLinks = [
    ...navLinks,
    { to: "/finder", label: t(UI.findSolution, locale) },
  ];

  return (
    <>
      <nav
        className={`pointer-events-none relative z-40 flex justify-center px-3 pt-3 sm:px-5 sm:pt-4 lg:px-6 transition-opacity duration-300 ${
          mobileCapsule ? "pointer-events-none opacity-0 max-md:invisible" : ""
        }`}
      >
        <div
          className={`nav-bar-pill pointer-events-auto relative overflow-visible rounded-full nav-glass px-2.5 sm:px-4 xl:px-5 ${
            scrolled
              ? "is-scrolled h-14 sm:h-[3.75rem]"
              : "h-16 sm:h-[4.25rem]"
          }`}
        >
          <div className="nav-bar-cluster">
            <Link
              to="/"
              onClick={closeMenu}
              className="flex shrink-0 items-center justify-center px-1"
              dir="ltr"
            >
              <SiteLogo
                alt={companyName}
                className="h-8 w-auto max-w-[5.75rem] object-contain object-right sm:h-11 sm:max-w-[8.5rem] xl:max-w-[9.5rem]"
              />
            </Link>

            <ul className="nav-bar-links">
              {desktopLinks.map((item) =>
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
                      tiles={megaProducts}
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
                  />
                ),
              )}
              {isWide ? (
                <NavItem
                  to="/finder"
                  label={t(UI.findSolution, locale)}
                  solid
                  onNavigate={closeMenu}
                />
              ) : (
                <MoreNavItem label={t(UI.nav.more, locale)} solid>
                  <MoreMenu locale={locale} onNavigate={closeMenu} />
                </MoreNavItem>
              )}
            </ul>
          </div>

          <div className="nav-bar-actions">
            <span className="nav-ask">
              <AskAgronomistButton
                href={waHref}
                label={askLabel}
                className="px-3 text-[13px]"
              />
            </span>
            <LanguageSwitch variant="toggle" tone="light" />
            <Link
              to="/products"
              className="ix-icon-btn inline-flex h-9 w-9 items-center justify-center rounded-full text-ink"
              aria-label={t(UI.searchProducts, locale)}
            >
              <IoSearchOutline className="text-xl" aria-hidden="true" />
            </Link>
            <button
              ref={menuBtnRef}
              type="button"
              onClick={() =>
                isMenuOpen
                  ? closeMenu()
                  : openMenuFrom(menuBtnRef.current)
              }
              className="ix-icon-btn inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink sm:h-10 sm:w-10"
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
        </div>
      </nav>

      <div
        className={`nav-mobile-capsule ${
          mobileCapsule && !isMenuOpen ? "is-visible" : ""
        }`}
      >
        <Link
          to="/"
          onClick={closeMenu}
          className="flex items-center"
          dir="ltr"
        >
          <SiteLogo
            variant="white"
            alt={companyName}
            className="h-7 w-auto max-w-[7rem] object-contain"
          />
        </Link>
        <button
          ref={capsuleBtnRef}
          type="button"
          onClick={() => openMenuFrom(capsuleBtnRef.current)}
          className="ix-icon-btn inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/12 text-white"
          aria-label={t(UI.openMenu, locale)}
        >
          <RiMenu2Line className="text-xl" aria-hidden="true" />
        </button>
      </div>

      <FullscreenMenu
        open={isMenuOpen}
        onClose={closeMenu}
        origin={menuOrigin}
        links={menuLinks}
      />
    </>
  );
}
