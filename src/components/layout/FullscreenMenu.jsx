import React, { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { IoClose } from "react-icons/io5";
import SafeImage from "@/components/ui/SafeImage";
import LanguageSwitch from "@/components/layout/LanguageSwitch";
import { useLocale } from "@/context/LocaleContext";
import { useSiteData } from "@/context/SiteDataContext";
import { getCategories, getProducts } from "@/services/cms/products";
import { getArticles } from "@/services/cms/articles";
import { getEvents } from "@/services/cms/events";
import { useHomepageSection } from "@/hooks/useHomepageSection";
import useMotionPrefs from "@/hooks/useMotionPrefs";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";
import { easeOut } from "@/lib/motion";

function pickPesticidesImage(categories = [], products = []) {
  const match =
    categories.find((category) => {
      const ar = String(category?.name?.ar || "").toLowerCase();
      const en = String(category?.name?.en || "").toLowerCase();
      const id = String(category?.id || "").toLowerCase();
      return (
        ar.includes("مبيد") ||
        en.includes("pesticid") ||
        id.includes("pesticid")
      );
    }) || categories[0];
  if (!match) return "";
  if (match.imageUrl) return match.imageUrl;
  const cover = products.find(
    (product) => product.sectionId === match.id && product.imageUrl,
  );
  return cover?.imageUrl || "";
}

export default function FullscreenMenu({
  open,
  onClose,
  origin = { x: 0, y: 0 },
  links = [],
}) {
  const { locale } = useLocale();
  const { contact } = useSiteData();
  const location = useLocation();
  const { reducedMotion, finePointer } = useMotionPrefs();
  const [hoverKey, setHoverKey] = useState("");
  const [isDesktop, setIsDesktop] = useState(false);

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
  const articlesQuery = useQuery({
    queryKey: ["cms", "articles"],
    queryFn: getArticles,
    staleTime: 1000 * 60 * 5,
  });
  const eventsQuery = useQuery({
    queryKey: ["cms", "events"],
    queryFn: getEvents,
    staleTime: 1000 * 60 * 5,
  });
  const heroQuery = useHomepageSection("hero");

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const sync = () => setIsDesktop(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!open) {
      setHoverKey("");
      return;
    }
    const match = links.find(
      (item) =>
        item.to === location.pathname ||
        (item.to !== "/" && location.pathname.startsWith(item.to)),
    );
    setHoverKey(match?.to || links[0]?.to || "");
  }, [open, location.pathname, links]);

  const previewMap = useMemo(() => {
    const categories = categoriesQuery.data || [];
    const products = productsQuery.data || [];
    const articles = [...(articlesQuery.data || [])].sort(
      (a, b) => (b.createdAt || 0) - (a.createdAt || 0),
    );
    const events = eventsQuery.data || [];
    const heroSlides = heroQuery.data?.slides || [];
    const heroImage =
      heroSlides.map((item) => item?.imageUrl).filter(Boolean)[0] ||
      heroQuery.data?.imageUrl ||
      "";

    return {
      "/": heroImage,
      "/products": pickPesticidesImage(categories, products),
      "/articles": articles.find((item) => item.imageUrl)?.imageUrl || "",
      "/events": events.find((item) => item.imageUrl)?.imageUrl || "",
      "/about": contact?.logoUrl || "",
      "/contact": contact?.bannerUrl || "",
      "/finder": pickPesticidesImage(categories, products),
    };
  }, [
    categoriesQuery.data,
    productsQuery.data,
    articlesQuery.data,
    eventsQuery.data,
    heroQuery.data,
    contact?.bannerUrl,
    contact?.logoUrl,
  ]);

  const activeKey = hoverKey || links[0]?.to || "/";
  const activeImage = previewMap[activeKey] || previewMap["/"] || "";
  const showPreview = isDesktop && finePointer;

  const originX =
    Number.isFinite(origin.x) && origin.x > 0
      ? origin.x
      : typeof window !== "undefined"
        ? window.innerWidth - 40
        : 0;
  const originY =
    Number.isFinite(origin.y) && origin.y > 0 ? origin.y : 40;

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[60]"
          initial={
            reducedMotion
              ? { opacity: 0 }
              : {
                  clipPath: `circle(0px at ${originX}px ${originY}px)`,
                  opacity: 1,
                }
          }
          animate={
            reducedMotion
              ? { opacity: 1 }
              : {
                  clipPath: `circle(160% at ${originX}px ${originY}px)`,
                  opacity: 1,
                }
          }
          exit={
            reducedMotion
              ? { opacity: 0, transitionEnd: { visibility: "hidden" } }
              : {
                  clipPath: `circle(0px at ${originX}px ${originY}px)`,
                  opacity: 1,
                  transitionEnd: { visibility: "hidden" },
                }
          }
          transition={{ duration: reducedMotion ? 0.01 : 0.5, ease: easeOut }}
          style={{ visibility: "visible" }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-[#0A0820]/55"
            aria-label={t(UI.closeMenu, locale)}
            onClick={onClose}
          />

          <div
            className="absolute inset-3 flex overflow-hidden rounded-2xl bg-[#110E33] text-white shadow-[0_24px_60px_rgba(10,8,32,0.45)]"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
          >
            <div className="relative z-10 flex min-h-0 min-w-0 flex-1 flex-col px-6 pb-6 pt-7 sm:px-10 sm:pt-9 md:px-12">
              <div className="mb-6 flex shrink-0 items-center justify-between border-b border-white/10 pb-4">
                <p className="font-mono text-[10px] font-medium uppercase tracking-[0.24em] text-brand-lime">
                  Menu
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="ix-icon-btn inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/12 text-white"
                  aria-label={t(UI.closeMenu, locale)}
                >
                  <IoClose className="text-2xl" aria-hidden="true" />
                </button>
              </div>

              <ul className="flex min-h-0 flex-1 flex-col justify-center gap-0 overflow-y-auto py-2 [scrollbar-width:thin]">
                {links.map((item, index) => (
                  <motion.li
                    key={item.to}
                    className="shrink-0"
                    initial={reducedMotion ? false : { opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.4,
                      ease: easeOut,
                      delay: reducedMotion ? 0 : 0.12 + index * 0.05,
                    }}
                  >
                    <NavLink
                      to={item.to}
                      end={item.end}
                      onClick={onClose}
                      onMouseEnter={() => {
                        if (finePointer) setHoverKey(item.to);
                      }}
                      onFocus={() => setHoverKey(item.to)}
                      className={({ isActive }) =>
                        `group relative inline-flex max-w-full items-baseline gap-4 py-2.5 font-display text-[clamp(1.75rem,4.2vw,2.35rem)] font-extrabold leading-none tracking-tight transition-colors duration-300 ${
                          isActive || hoverKey === item.to
                            ? "text-brand-lime"
                            : "text-white"
                        }`
                      }
                    >
                      <span
                        className="shrink-0 font-mono text-xs font-medium tracking-[0.18em] text-white/35"
                        dir="ltr"
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="min-w-0 break-words">{item.label}</span>
                      {finePointer ? (
                        <span
                          className="ms-2 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-lime text-sm text-[#0A0820] opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
                          aria-hidden="true"
                        >
                          ←
                        </span>
                      ) : null}
                    </NavLink>
                  </motion.li>
                ))}
              </ul>

              <motion.div
                className="mt-4 flex shrink-0 flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5"
                initial={reducedMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  ease: easeOut,
                  delay: reducedMotion ? 0 : 0.2 + links.length * 0.05,
                }}
              >
                <LanguageSwitch variant="toggle" tone="dark" />
                <Link
                  to="/contact"
                  onClick={onClose}
                  className="ix-link text-sm font-semibold text-white/80"
                >
                  {t(UI.nav.contact, locale)}
                </Link>
              </motion.div>
            </div>

            {showPreview ? (
              <div className="relative hidden h-full w-[40%] shrink-0 md:block">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeKey + activeImage}
                    className="absolute inset-4 overflow-hidden rounded-xl bg-[#0A0820]"
                    initial={reducedMotion ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35, ease: easeOut }}
                  >
                    {activeImage ? (
                      <SafeImage
                        src={activeImage}
                        alt=""
                        width={900}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-[#181060]" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#110E33]/70 via-transparent to-transparent" />
                  </motion.div>
                </AnimatePresence>
              </div>
            ) : null}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
