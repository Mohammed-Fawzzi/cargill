import React, { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { IoClose } from "react-icons/io5";
import { RiMenu2Line } from "react-icons/ri";
import { NAV_LINKS } from "@constants/navLinks";
import SiteLogo from "@/components/ui/SiteLogo";
import LanguageSwitch from "@/components/layout/LanguageSwitch";
import { useLocale } from "@/context/LocaleContext";
import { useSiteData } from "@/context/SiteDataContext";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";

const linkClass = ({ isActive }) =>
  `inline-block rounded-md px-2 py-1 font-bold transition-colors hover:text-brand-lime ${
    isActive ? "text-brand-lime" : "text-white/90"
  }`;

export default function Navbar() {
  const { locale } = useLocale();
  const { contact } = useSiteData();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const companyName = t(contact?.companyName, locale);

  const closeMenu = () => setIsMenuOpen(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const windowHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      if (windowHeight <= 0) {
        setScrollProgress(0);
        return;
      }
      setScrollProgress(Math.min(100, Math.max(0, (scrollTop / windowHeight) * 100)));
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  return (
    <nav className="fixed inset-x-0 top-0 z-20 bg-brand-black shadow-[0_1px_12px_rgba(0,0,0,0.35)]">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="hidden min-h-[96px] grid-cols-[auto_1fr_auto] items-center gap-6 py-2 lg:grid">
          <Link to="/" className="flex shrink-0 items-center gap-3">
            <SiteLogo
              alt={companyName}
              className="h-[72px] w-auto max-w-[220px] object-contain"
            />
          </Link>

          <ul className="flex items-center justify-center gap-x-6 text-base">
            {NAV_LINKS.map((link) => (
              <li key={link.path}>
                <NavLink to={link.path} end={link.path === "/"} className={linkClass}>
                  {t(UI.nav[link.key], locale)}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            <LanguageSwitch />
            <Link
              to="/contact"
              className="inline-flex rounded-full bg-brand-lime px-5 py-2.5 text-sm font-extrabold text-brand-black transition-colors hover:bg-brand-lime-hover"
            >
              {t(UI.nav.contact, locale)}
            </Link>
          </div>
        </div>

        <div className="flex min-h-[84px] items-center justify-between gap-2 py-2 lg:hidden">
          <Link to="/" onClick={closeMenu} className="shrink-0">
            <SiteLogo
              alt={companyName}
              className="h-[3.75rem] w-auto max-w-[160px] object-contain"
            />
          </Link>

          <div className="flex items-center gap-2">
            <LanguageSwitch compact />
            <button
              type="button"
              onClick={() => setIsMenuOpen((open) => !open)}
              className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border border-brand-lime/40 text-white transition-colors hover:bg-brand-lime/10"
              aria-label={isMenuOpen ? t(UI.closeMenu, locale) : t(UI.openMenu, locale)}
            >
              {isMenuOpen ? (
                <IoClose className="text-2xl" />
              ) : (
                <RiMenu2Line className="text-2xl" />
              )}
            </button>
          </div>
        </div>

        <div
          className={`border-t border-white/10 transition-all duration-300 lg:hidden ${
            isMenuOpen ? "block" : "hidden"
          }`}
        >
          <ul className="flex flex-col items-center gap-4 py-5 text-base">
            {NAV_LINKS.map((link) => (
              <li key={link.path}>
                <NavLink
                  to={link.path}
                  end={link.path === "/"}
                  onClick={closeMenu}
                  className={linkClass}
                >
                  {t(UI.nav[link.key], locale)}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-[3px] bg-brand-lime/20"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 z-[999] h-[3px] bg-brand-lime"
        style={{ width: `${scrollProgress}%` }}
        aria-hidden="true"
      />
    </nav>
  );
}
