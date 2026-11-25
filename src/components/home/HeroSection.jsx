import React, { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, useMotionValue, useSpring } from "framer-motion";
import SafeImage from "@/components/ui/SafeImage";
import MagneticButton from "@/components/ui/MagneticButton";
import AmbientGlow from "@/components/ui/AmbientGlow";
import AccentHeading from "@/components/ui/AccentHeading";
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

const BrandTriangle3D = lazy(() => import("@/components/ui/BrandTriangle3D"));

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
          open ? "cinema-grade-open" : "cinema-grade"
        } ${
          open
            ? "scale-105 duration-[9000ms]"
            : "scale-100 duration-700 group-hover:scale-[1.03]"
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
      initial={reducedMotion ? false : { clipPath: "inset(100% 0 0 0)" }}
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
        className={`group relative block h-full overflow-hidden border border-line/10 bg-brand-navy outline-none focus-visible:ring-2 focus-visible:ring-brand-lime focus-visible:ring-offset-2 focus-visible:ring-offset-page ${
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
          className={`absolute inset-0 mix-blend-multiply transition-colors duration-500 ${
            open ? "bg-brand-navy/30" : "bg-brand-navy/50"
          }`}
        />

        <span className="absolute start-3 top-3 z-10 font-mono text-[11px] font-bold tracking-[0.2em] text-brand-lime sm:start-4 sm:top-4">
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
              <span className="inline-flex items-center gap-2 border border-brand-lime bg-brand-lime px-3.5 py-2 text-xs font-extrabold text-brand-navy transition-colors group-hover:bg-brand-lime-hover">
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

  const headlineDelay = reducedMotion ? 0 : 0.35;

  return (
    <section className="relative flex min-h-[640px] flex-col overflow-hidden bg-page pt-[calc(var(--navbar-height)+var(--ticker-height)+0.5rem)] text-ink md:h-[calc(100svh-0.5rem)] md:min-h-[640px]">
      <div className="relative mx-auto flex w-full max-w-[1400px] shrink-0 flex-col gap-6 px-4 pb-5 pt-4 sm:px-6 lg:px-8 lg:pb-6">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <AmbientGlow className="start-[20%] top-[30%] h-48 w-56 -translate-y-1/2 opacity-80 sm:h-56 sm:w-64" />
          <Suspense
            fallback={
              <TriangleAccent className="absolute start-[18%] top-[24%] h-24 w-28 opacity-25 sm:h-28 sm:w-32" />
            }
          >
            <BrandTriangle3D className="absolute start-[14%] top-[20%] z-0 h-28 w-32 opacity-40 sm:h-36 sm:w-40 lg:h-40 lg:w-48" />
          </Suspense>
        </div>

        <div className="relative z-10 flex flex-col gap-5 lg:max-w-[min(100%,920px)]">
          <motion.p
            className="text-clip-safe font-mono text-[11px] font-bold tracking-[0.22em] text-brand-lime sm:text-xs"
            initial={reducedMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: headlineDelay, ease: SPROUT_EASE }}
          >
            § 01 — {t(UI.heroMonoLabel, locale)}
          </motion.p>

          {title ? (
            <motion.div
              initial={reducedMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: headlineDelay + 0.06,
                ease: SPROUT_EASE,
              }}
            >
              <AccentHeading
                as="h1"
                text={title}
                className="text-clip-safe text-[1.7rem] font-extrabold leading-[1.2] tracking-tight text-ink sm:text-4xl lg:text-[2.65rem] xl:text-[3rem]"
              />
            </motion.div>
          ) : null}

          {body ? (
            <motion.p
              className="max-w-xl text-sm leading-7 text-ink/70 sm:text-[15px] sm:leading-8"
              initial={reducedMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.45,
                delay: headlineDelay + 0.14,
                ease: SPROUT_EASE,
              }}
            >
              {body}
            </motion.p>
          ) : null}

          <motion.div
            className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center"
            initial={reducedMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.45,
              delay: headlineDelay + 0.22,
              ease: SPROUT_EASE,
            }}
          >
            <MagneticButton strength={6} className="w-full sm:w-auto">
              <Link
                to="/finder"
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 bg-brand-lime px-6 text-sm font-extrabold text-brand-navy transition-colors hover:bg-brand-lime-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime focus-visible:ring-offset-2 focus-visible:ring-offset-page sm:w-auto"
              >
                {t(UI.findSolution, locale)}
              </Link>
            </MagneticButton>
            <MagneticButton strength={6} className="w-full sm:w-auto">
              <Link
                to="/products"
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 border border-line/20 px-6 text-sm font-bold text-ink transition-colors hover:border-brand-lime hover:text-brand-lime focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime sm:w-auto"
              >
                {t(UI.browseProducts, locale)}
              </Link>
            </MagneticButton>
            {waHref ? (
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 w-full items-center justify-center text-sm font-bold text-ink underline-offset-4 transition-colors hover:text-brand-lime hover:underline sm:w-auto"
              >
                {t(UI.askAgronomist, locale)}
              </a>
            ) : null}
          </motion.div>
        </div>
      </div>

      <div className="relative z-10 mx-auto flex min-h-0 w-full max-w-[1400px] flex-1 flex-col px-4 pb-4 sm:px-6 lg:px-8 lg:pb-6">
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
          <div className="flex min-h-[280px] flex-1 items-center justify-center border border-line/10 bg-brand-navy/40">
            <p className="text-sm text-ink/60">{t(UI.loading, locale)}</p>
          </div>
        )}
      </div>
    </section>
  );
}