import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import SafeImage from "@/components/ui/SafeImage";
import { TriangleAccent } from "@/components/ui/TriangleMask";
import { useLocale } from "@/context/LocaleContext";
import { useSiteData } from "@/context/SiteDataContext";
import { getCategories } from "@/services/cms/products";
import { toWhatsAppHref } from "@/lib/phone";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";
import { easeOut } from "@/lib/motion";

const MAX_LIST = 6;

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  return reduced;
}

function useIsMobile(breakpoint = 768) {
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const sync = () => setMobile(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, [breakpoint]);

  return mobile;
}

export default function FeaturedProductsSection({ section }) {
  const { locale } = useLocale();
  const { contact } = useSiteData();
  const reducedMotion = usePrefersReducedMotion();
  const isMobile = useIsMobile();
  const featuredRef = useRef(null);
  const [activeId, setActiveId] = useState("");

  const items = useMemo(
    () => (section?.items || []).filter(Boolean).slice(0, MAX_LIST),
    [section?.items],
  );
  const dashboardTitle = t(section?.data?.title, locale);
  const dashboardBody = t(section?.data?.body, locale);
  const heading = dashboardTitle || t(UI.featuredHeading, locale);

  const categoriesQuery = useQuery({
    queryKey: ["cms", "categories"],
    queryFn: getCategories,
    staleTime: 1000 * 60 * 5,
  });

  const categoryNameById = useMemo(() => {
    const map = new Map();
    for (const category of categoriesQuery.data || []) {
      map.set(category.id, t(category.name, locale));
    }
    return map;
  }, [categoriesQuery.data, locale]);

  useEffect(() => {
    if (!items.length) {
      setActiveId("");
      return;
    }
    setActiveId((current) =>
      items.some((item) => item.id === current) ? current : items[0].id,
    );
  }, [items]);

  const active = items.find((item) => item.id === activeId) || items[0] || null;
  const phone = contact?.phones?.[0] || "";
  const activeName = active ? t(active.name, locale) : "";
  const activeCategory = active
    ? categoryNameById.get(active.sectionId) || ""
    : "";
  const activeOverview =
    (active && t(active.overview, locale)) ||
    (active && t(active.details, locale)) ||
    "";
  const waMessage = t(UI.askAboutProductMessage, locale).replace(
    "{name}",
    activeName || "",
  );
  const waHref = toWhatsAppHref(phone, waMessage);

  const selectProduct = (id) => {
    setActiveId(id);
    if (isMobile && featuredRef.current) {
      featuredRef.current.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "start",
      });
    }
  };

  if (!items.length) return null;

  return (
    <section className="bg-white py-[4.5rem] sm:py-24 lg:py-[7.5rem]">
      <motion.div
        className="container mx-auto px-4 lg:px-8"
        initial={reducedMotion ? false : { opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.12 }}
        transition={{ duration: 0.35, ease: easeOut }}
      >
        <div className="mb-6 flex items-center gap-4">
          <p className="shrink-0 text-[11px] font-bold tracking-[0.18em] text-brand-ink">
            {t(UI.featuredLabel, locale)}
          </p>
          <span className="h-px flex-1 bg-brand-ink" aria-hidden="true" />
          <p className="shrink-0 text-[11px] font-bold tracking-[0.2em] text-brand-ink/55">
            04
          </p>
        </div>

        <div className="mb-10 flex flex-col gap-4 sm:mb-14 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-extrabold tracking-tight text-brand-ink sm:text-4xl lg:text-[2.75rem]">
              {heading}
            </h2>
            {dashboardBody ? (
              <p className="mt-3 max-w-2xl text-sm leading-7 text-text-muted sm:text-base sm:leading-8">
                {dashboardBody}
              </p>
            ) : null}
          </div>
          <Link
            to="/products"
            className="inline-flex w-fit items-center gap-2 border-b-2 border-brand-lime pb-0.5 text-sm font-bold text-brand-ink transition-[border-width] hover:border-b-[3px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime focus-visible:ring-offset-2"
          >
            <span>{t(UI.viewAllProducts, locale)}</span>
            <span aria-hidden="true">←</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-8">
          <div ref={featuredRef} className="scroll-mt-28 lg:col-span-7">
            <AnimatePresence mode="wait" initial={false}>
              {active ? (
                <motion.div
                  key={active.id}
                  initial={reducedMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={reducedMotion ? undefined : { opacity: 0 }}
                  transition={{ duration: 0.25, ease: easeOut }}
                >
                  <div className="relative mb-6 flex aspect-[4/3] items-center justify-center overflow-hidden bg-surface-muted">
                    <TriangleAccent className="absolute end-4 top-4 z-10 h-3 w-3.5" />
                    {active.imageUrl ? (
                      <SafeImage
                        src={active.imageUrl}
                        alt={activeName}
                        width={1000}
                        loading="lazy"
                        className="h-full w-full object-contain p-6 sm:p-10"
                      />
                    ) : (
                      <p className="px-6 text-center text-lg font-bold text-brand-ink/50">
                        {activeName}
                      </p>
                    )}
                  </div>

                  {activeCategory ? (
                    <p className="mb-2 text-[11px] font-bold tracking-[0.16em] text-brand-lime">
                      {activeCategory}
                    </p>
                  ) : null}
                  <h3 className="mb-3 text-2xl font-extrabold tracking-tight text-brand-ink sm:text-3xl lg:text-[2.25rem]">
                    {activeName}
                  </h3>
                  {activeOverview ? (
                    <p className="mb-6 line-clamp-3 text-sm leading-7 text-text-muted sm:text-base sm:leading-8">
                      {activeOverview}
                    </p>
                  ) : null}

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <Link
                      to={`/products/${active.id}`}
                      className="inline-flex min-h-11 items-center justify-center gap-2 bg-brand-lime px-5 text-sm font-extrabold text-brand-ink transition-colors hover:bg-brand-lime-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime focus-visible:ring-offset-2"
                    >
                      <span>{t(UI.productDetails, locale)}</span>
                      <span aria-hidden="true">←</span>
                    </Link>
                    {waHref ? (
                      <a
                        href={waHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex text-sm font-bold text-brand-ink underline-offset-4 transition-colors hover:text-brand-lime hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime"
                      >
                        {t(UI.askAboutWhatsApp, locale)}
                      </a>
                    ) : null}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          <div className="lg:col-span-4 lg:col-start-9">
            <div className="hidden lg:block">
              {items.map((item, index) => {
                const name = t(item.name, locale);
                const category = categoryNameById.get(item.sectionId) || "";
                const isActive = item.id === active?.id;
                const number = String(index + 1).padStart(2, "0");

                return (
                  <button
                    key={item.id}
                    type="button"
                    onMouseEnter={() => setActiveId(item.id)}
                    onFocus={() => setActiveId(item.id)}
                    onClick={() => setActiveId(item.id)}
                    className={`flex w-full items-baseline gap-3 border-b border-brand-ink/10 py-4 text-start transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime ${
                      isActive ? "border-brand-lime" : ""
                    }`}
                    aria-current={isActive ? "true" : undefined}
                  >
                    <span className="w-7 shrink-0 text-[11px] font-bold tracking-[0.16em] text-brand-ink/40">
                      {number}
                    </span>
                    <span
                      className={`min-w-0 flex-1 text-base font-bold ${
                        isActive
                          ? "text-brand-lime underline decoration-brand-lime underline-offset-4"
                          : "text-brand-ink"
                      }`}
                    >
                      {name}
                      {isActive ? (
                        <span aria-hidden="true" className="ms-2 inline-block">
                          ←
                        </span>
                      ) : null}
                    </span>
                    {category ? (
                      <span className="shrink-0 text-[11px] font-medium text-text-muted">
                        {category}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>

            <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:hidden">
              {items.map((item) => {
                const name = t(item.name, locale);
                const isActive = item.id === active?.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => selectProduct(item.id)}
                    className={`shrink-0 border px-3.5 py-2 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime ${
                      isActive
                        ? "border-brand-lime bg-brand-lime text-brand-ink"
                        : "border-brand-ink/15 bg-white text-brand-ink"
                    }`}
                    aria-current={isActive ? "true" : undefined}
                  >
                    {name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
