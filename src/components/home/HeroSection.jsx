import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, useMotionValue, useSpring } from "framer-motion";
import SafeImage from "@/components/ui/SafeImage";
import MagneticButton from "@/components/ui/MagneticButton";
import { TriangleAccent } from "@/components/ui/TriangleMask";
import { useLocale } from "@/context/LocaleContext";
import { useSiteData } from "@/context/SiteDataContext";
import { getCategories, getProducts } from "@/services/cms/products";
import { toWhatsAppHref } from "@/lib/phone";
import { normalizeImageUrl } from "@/lib/image";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";
import { easeOut } from "@/lib/motion";
import useMotionPrefs from "@/hooks/useMotionPrefs";

const PANEL_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const OPEN_FLEX = 3;
const CLOSED_FLEX = 1;
const SPROUT_EASE = [0.22, 1, 0.36, 1];

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

function PanelImage({ src, open, eager, canParallax }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 120, damping: 24, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 120, damping: 24, mass: 0.4 });
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!canParallax || !open) {
      x.set(0);
      y.set(0);
      return undefined;
    }

    const onMove = (event) => {
      const node = wrapRef.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      x.set(-px * 12);
      y.set(-py * 12);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [canParallax, open, x, y]);

  if (!src) return null;

  return (
    <motion.div
      ref={wrapRef}
      className="absolute inset-0"
      style={canParallax && open ? { x: springX, y: springY } : undefined}
    >
      <SafeImage
        src={src}
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
    </motion.div>
  );
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
  canParallax,
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
    <motion.div
      className={isMobile ? "w-full" : "h-full min-h-0"}
      style={
        isMobile
          ? undefined
          : {
              flexGrow: open ? OPEN_FLEX : CLOSED_FLEX,
              flexBasis: 0,
              transition: reducedMotion
                ? undefined
                : `flex-grow ${duration} ${PANEL_EASE}`,
            }
      }
      initial={
        reducedMotion
          ? false
          : { clipPath: "inset(100% 0 0 0)" }
      }
      animate={{ clipPath: "inset(0% 0 0 0)" }}
      transition={{
        duration: reducedMotion ? 0 : 0.9,
        delay: reducedMotion ? 0 : index * 0.09,
        ease: SPROUT_EASE,
      }}
    >
      <Link
        to={href}
        onMouseEnter={() => {
          if (!isMobile) onActivate();
        }}
        onFocus={onActivate}
        onClick={handleClick}
        aria-expanded={open}
        aria-label={panel.name}
        className={`group relative block h-full overflow-hidden rounded-lg bg-brand-ink outline-none focus-visible:ring-2 focus-visible:ring-brand-lime focus-visible:ring-offset-2 focus-visible:ring-offset-brand-forest-deep ${
          isMobile ? "w-full" : "min-h-0"
        }`}
        style={
          isMobile
            ? {
                height: open ? 320 : 72,
                transition: `height ${duration} ${PANEL_EASE}`,
              }
            : { height: "100%" }
        }
      >
        <PanelImage
          src={panel.imageUrl}
          open={open}
          eager={eager}
          canParallax={canParallax}
        />

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
            <div className="max-w-md pe-1">
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
            <p className="text-clip-safe text-base font-extrabold tracking-tight text-white">
              {panel.name}
            </p>
          </div>
        ) : (
          <div className="absolute bottom-4 start-4 z-10 py-1">
            <p
              className="text-clip-safe text-sm font-extrabold tracking-wide text-white sm:text-base"
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
    </motion.div>
  );
}

function HeadlineLines({ title, brand, reducedMotion, delay }) {
  const lines = useMemo(() => {
    const parts = String(title || "")
      .trim()
      .split(/\n+/)
      .filter(Boolean);
    if (parts.length > 1) return parts;
    const words = String(title || "").trim().split(/\s+/).filter(Boolean);
    if (words.length <= 4) return [words.join(" ")];
    const mid = Math.ceil(words.length / 2);
    return [words.slice(0, mid).join(" "), words.slice(mid).join(" ")];
  }, [title]);

  return (
    <div className="min-w-0 lg:max-w-[58%]">
      <motion.div
        className="mb-3 flex items-center gap-3"
        initial={reducedMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay, ease: SPROUT_EASE }}
      >
        <p className="text-clip-safe text-[11px] font-bold tracking-[0.18em] text-brand-lime sm:text-xs">
          {brand}
        </p>
        <span className="h-px w-10 bg-brand-lime sm:w-14" aria-hidden="true" />
      </motion.div>
      {title ? (
        <h1 className="text-[1.7rem] font-extrabold leading-[1.2] tracking-tight sm:text-4xl lg:text-[2.65rem] xl:text-[3rem]">
          {lines.map((line, index) => (
            <span
              key={`${line}-${index}`}
              className="block overflow-hidden py-[0.12em]"
            >
              <motion.span
                className="block leading-[1.2] lg:whitespace-nowrap"
                initial={reducedMotion ? false : { y: "110%", opacity: 0 }}
                animate={{ y: "0%", opacity: 1 }}
                transition={{
                  duration: 0.55,
                  delay: delay + 0.08 + index * 0.1,
                  ease: SPROUT_EASE,
                }}
              >
                {line}
              </motion.span>
            </span>
          ))}
        </h1>
      ) : null}
    </div>
  );
}

export default function HeroSection({ section }) {
  const { locale } = useLocale();
  const { contact } = useSiteData();
  const { reducedMotion, canTilt } = useMotionPrefs();
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

  const headlineDelay = reducedMotion ? 0 : 0.42;

  return (
    <section className="flex min-h-[640px] flex-col bg-brand-forest-deep pt-[calc(var(--navbar-height)+0.5rem)] text-white md:h-[calc(100svh-0.5rem)] md:min-h-[640px]">
      <div className="mx-auto flex w-full max-w-[1400px] shrink-0 flex-col gap-5 px-4 pb-5 pt-3 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:gap-10 lg:px-8 lg:pb-6 lg:pt-4">
        <HeadlineLines
          title={title}
          brand={brand}
          reducedMotion={reducedMotion}
          delay={headlineDelay}
        />

        <motion.div
          className="flex max-w-md flex-col gap-4 lg:items-end lg:text-end"
          initial={reducedMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: headlineDelay + 0.2, ease: SPROUT_EASE }}
        >
          {body ? (
            <p className="text-sm leading-7 text-white/75 sm:text-[15px] sm:leading-8">
              {body}
            </p>
          ) : null}
          {waHref ? (
            <MagneticButton strength={6} className="w-full sm:w-auto">
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-10 w-full items-center justify-center gap-2 border border-white/55 px-4 text-sm font-bold text-white transition-colors hover:border-brand-lime hover:text-brand-lime focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime sm:w-auto"
              >
                {t(UI.askAgronomist, locale)}
              </a>
            </MagneticButton>
          ) : null}
        </motion.div>
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
                canParallax={canTilt && !isMobile}
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
