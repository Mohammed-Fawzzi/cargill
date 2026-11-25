import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import SafeImage from "@/components/ui/SafeImage";
import { TriangleAccent } from "@/components/ui/TriangleMask";
import { useLocale } from "@/context/LocaleContext";
import { useSiteData } from "@/context/SiteDataContext";
import { getCategories, getProducts } from "@/services/cms/products";
import { toWhatsAppHref } from "@/lib/phone";
import { normalizeImageUrl } from "@/lib/image";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";
import { easeOut } from "@/lib/motion";

const PANEL_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const OPEN_FLEX = 3;
const CLOSED_FLEX = 1;

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

function Panel({
  panel,
  index,
  open,
  onActivate,
  isMobile,
  locale,
  reducedMotion,
  eager,
}) {
  const number = String(index + 1).padStart(2, "0");
  const href = `/products?section=${encodeURIComponent(panel.id)}`;
  const duration = reducedMotion ? "0ms" : "600ms";

  const handleClick = (event) => {
    if (isMobile && !open) {
      event.preventDefault();
      onActivate();
    }
  };

  return (
    <Link
      to={href}
      onMouseEnter={() => {
        if (!isMobile) onActivate();
      }}
      onFocus={onActivate}
      onClick={handleClick}
      aria-expanded={open}
      aria-label={panel.name}
      className={`group relative block overflow-hidden rounded-lg bg-brand-ink outline-none focus-visible:ring-2 focus-visible:ring-brand-lime focus-visible:ring-offset-2 focus-visible:ring-offset-brand-forest-deep ${
        isMobile ? "w-full" : "h-full min-h-0"
      }`}
      style={
        isMobile
          ? {
              height: open ? 320 : 72,
              transition: `height ${duration} ${PANEL_EASE}`,
            }
          : {
              flexGrow: open ? OPEN_FLEX : CLOSED_FLEX,
              flexBasis: 0,
              transition: `flex-grow ${duration} ${PANEL_EASE}`,
            }
      }
    >
      {panel.imageUrl ? (
        <SafeImage
          src={panel.imageUrl}
          alt=""
          width={open || eager ? 1200 : 640}
          loading={eager ? "eager" : "lazy"}
          fetchPriority={eager ? "high" : "auto"}
          className={`absolute inset-0 h-full w-full object-cover transition-transform ease-out motion-reduce:transition-none motion-reduce:transform-none ${
            open
              ? "scale-110 duration-[6000ms]"
              : "scale-100 duration-700 group-hover:scale-105"
          }`}
          aria-hidden="true"
        />
      ) : null}

      <div
        className={`absolute inset-0 transition-colors duration-500 ${
          open ? "bg-brand-ink/30" : "bg-brand-ink/55"
        }`}
      />

      <span className="absolute start-3 top-3 z-10 text-[11px] font-bold tracking-[0.2em] text-brand-lime sm:start-4 sm:top-4">
        {number}
      </span>

      {open ? (
        <TriangleAccent className="absolute end-3 top-3 z-10 h-3 w-3.5 sm:end-4 sm:top-4" />
      ) : null}

      {open ? (
        <motion.div
          key={`open-${panel.id}`}
          className="absolute inset-x-0 bottom-0 z-10 p-3 sm:p-5"
          initial={reducedMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: easeOut }}
        >
          <div className="max-w-md">
            <h3 className="mb-2 text-xl font-extrabold tracking-tight text-white sm:text-2xl lg:text-[1.75rem]">
              {panel.name}
            </h3>
            {panel.description ? (
              <p className="mb-4 line-clamp-2 text-sm leading-6 text-white/80">
                {panel.description}
              </p>
            ) : null}
            <span className="inline-flex items-center gap-2 border border-brand-lime bg-brand-lime px-3.5 py-2 text-xs font-extrabold text-brand-ink transition-colors group-hover:bg-brand-lime-hover">
              {t(UI.browseProducts, locale)}
              <span aria-hidden="true" className="rtl:rotate-180">
                ←
              </span>
            </span>
          </div>
        </motion.div>
      ) : isMobile ? (
        <div className="absolute inset-x-0 bottom-0 z-10 flex items-center px-3 pb-3 pt-8">
          <p className="text-base font-extrabold tracking-tight text-white">
            {panel.name}
          </p>
        </div>
      ) : (
        <div className="absolute bottom-4 start-4 z-10">
          <p
            className="text-sm font-extrabold tracking-wide text-white sm:text-base"
            style={{
              writingMode: "vertical-rl",
              transform: "rotate(180deg)",
            }}
          >
            {panel.name}
          </p>
        </div>
      )}
    </Link>
  );
}

export default function HeroSection({ section }) {
  const { locale } = useLocale();
  const { contact } = useSiteData();
  const reducedMotion = usePrefersReducedMotion();
  const isMobile = useIsMobile();
  const [active, setActive] = useState(0);

  const slides = useMemo(() => section?.data?.slides || [], [section?.data?.slides]);
  const headlineSlide = slides.find((slide) => t(slide?.title, locale)) || slides[0];
  const title = t(headlineSlide?.title, locale);
  const body = t(headlineSlide?.body, locale);
  const brand = t(contact?.companyName, locale) || t(UI.brandLabel, locale);
  const phone = contact?.phones?.[0] || "";
  const waHref = toWhatsAppHref(phone, t(UI.askAgronomistMessage, locale));
  const heroImages = useMemo(
    () => slides.map((slide) => slide?.imageUrl).filter(Boolean),
    [slides],
  );

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

  const panels = useMemo(() => {
    const categories = (categoriesQuery.data || []).slice(0, 4);
    const products = productsQuery.data || [];
    return categories.map((category, index) => {
      const cover = products.find(
        (product) => product.sectionId === category.id && product.imageUrl,
      );
      const fallback =
        heroImages.length > 0 ? heroImages[index % heroImages.length] : "";
      return {
        id: category.id,
        name: t(category.name, locale),
        description: "",
        imageUrl: cover?.imageUrl || fallback,
      };
    });
  }, [categoriesQuery.data, productsQuery.data, heroImages, locale]);

  useEffect(() => {
    if (!panels.length) return;
    setActive((current) => Math.min(current, panels.length - 1));
  }, [panels.length]);

  useEffect(() => {
    const first = panels[0]?.imageUrl;
    if (!first) return undefined;
    const src = normalizeImageUrl(first, { width: 1200, quality: 72 });
    if (!src) return undefined;
    const image = new Image();
    image.src = src;
    return undefined;
  }, [panels]);

  if (!title && !body && !panels.length) return null;

  return (
    <section className="flex min-h-[640px] flex-col bg-brand-forest-deep pt-[calc(var(--navbar-height)+0.5rem)] text-white md:h-[calc(100svh-0.5rem)] md:min-h-[640px]">
      <div className="mx-auto flex w-full max-w-[1400px] shrink-0 flex-col gap-5 px-4 pb-5 pt-3 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:gap-10 lg:px-8 lg:pb-6 lg:pt-4">
        <motion.div
          className="min-w-0 lg:max-w-[58%]"
          initial={reducedMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: easeOut }}
        >
          <div className="mb-3 flex items-center gap-3">
            <p className="text-[11px] font-bold tracking-[0.18em] text-brand-lime sm:text-xs">
              {brand}
            </p>
            <span className="h-px w-10 bg-brand-lime sm:w-14" aria-hidden="true" />
          </div>
          {title ? (
            <h1 className="text-[1.7rem] font-extrabold leading-[1.15] tracking-tight sm:text-4xl lg:whitespace-nowrap lg:text-[2.65rem] xl:text-[3rem]">
              {title}
            </h1>
          ) : null}
        </motion.div>

        <div className="flex max-w-md flex-col gap-4 lg:items-end lg:text-end">
          {body ? (
            <p className="text-sm leading-7 text-white/75 sm:text-[15px] sm:leading-8">
              {body}
            </p>
          ) : null}
          {waHref ? (
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-10 w-full items-center justify-center gap-2 border border-white/55 px-4 text-sm font-bold text-white transition-colors hover:border-brand-lime hover:text-brand-lime focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime sm:w-auto"
            >
              {t(UI.askAgronomist, locale)}
            </a>
          ) : null}
        </div>
      </div>

      <div className="mx-auto flex min-h-0 w-full max-w-[1400px] flex-1 flex-col px-4 pb-4 sm:px-6 lg:px-8 lg:pb-6">
        {panels.length ? (
          <div
            className={`flex min-h-[280px] flex-1 gap-2 ${
              isMobile ? "flex-col" : "flex-row"
            }`}
            onMouseLeave={() => {
              if (!isMobile) setActive(0);
            }}
          >
            {panels.map((panel, index) => (
              <Panel
                key={panel.id}
                panel={panel}
                index={index}
                open={active === index}
                onActivate={() => setActive(index)}
                isMobile={isMobile}
                locale={locale}
                reducedMotion={reducedMotion}
                eager={index === 0}
              />
            ))}
          </div>
        ) : (
          <div className="flex min-h-[280px] flex-1 items-center justify-center rounded-lg bg-brand-ink/40">
            <p className="text-sm text-white/60">{t(UI.loading, locale)}</p>
          </div>
        )}
      </div>
    </section>
  );
}
