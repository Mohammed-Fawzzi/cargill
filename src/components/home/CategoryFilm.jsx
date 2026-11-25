import React, { useEffect, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import SafeImage from "@/components/ui/SafeImage";
import SplitArrowButton from "@/components/ui/SplitArrowButton";
import { useLocale } from "@/context/LocaleContext";
import { useSiteData } from "@/context/SiteDataContext";
import { getCategories, getProducts } from "@/services/cms/products";
import { toWhatsAppHref } from "@/lib/phone";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";
import useMotionPrefs from "@/hooks/useMotionPrefs";

function plainText(value) {
  return String(value || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function clamp01(value) {
  return Math.min(1, Math.max(0, value));
}

function slidePose(progress, count) {
  if (count <= 1) return { from: 0, to: 0, mix: 0 };
  const x = clamp01(progress) * (count - 1);
  const from = Math.min(count - 2, Math.floor(x));
  const local = x >= count - 1 ? 1 : x - from;
  const start = 0.64;
  const mix = local <= start ? 0 : clamp01((local - start) / (1 - start));
  return { from, to: from + 1, mix };
}

function outOpacity(mix) {
  return 1 - clamp01(mix / 0.7);
}

function inOpacity(mix) {
  return clamp01((mix - 0.3) / 0.7);
}

function buildSlides(categories, products) {
  return (categories || [])
    .map((category) => {
      const rows = (products || []).filter(
        (product) => product.sectionId === category.id,
      );
      const image =
        rows.find((product) => product.imageUrl)?.imageUrl ||
        category.imageUrl ||
        "";
      if (!image) return null;
      const overview =
        rows.find((product) => plainText(product.overview?.ar || product.overview?.en))
          ?.overview || null;
      return {
        id: category.id,
        name: category.name,
        overview,
        image,
      };
    })
    .filter(Boolean);
}

function applyFilm(root, progress) {
  const photos = [...root.querySelectorAll("[data-film-photo]")];
  const copies = [...root.querySelectorAll("[data-film-copy]")];
  const ticks = [...root.querySelectorAll("[data-film-tick]")];
  const count = photos.length;
  const { from, to, mix } = slidePose(progress, count);
  const outgoing = outOpacity(mix);
  const incoming = inOpacity(mix);

  photos.forEach((node, index) => {
    let opacity = 0;
    if (index === from) opacity = outgoing;
    if (index === to) opacity = Math.max(opacity, incoming);
    node.style.opacity = String(opacity);
    node.style.zIndex = index === to ? "2" : "1";
  });

  copies.forEach((node, index) => {
    let opacity = 0;
    if (index === from) opacity = outgoing;
    if (index === to) opacity = Math.max(opacity, incoming);
    node.style.opacity = String(opacity);
    node.style.pointerEvents = opacity > 0.45 ? "auto" : "none";
    if (opacity > 0.2) node.removeAttribute("aria-hidden");
    else node.setAttribute("aria-hidden", "true");
  });

  const active = incoming > outgoing ? to : from;
  ticks.forEach((node, index) => {
    const on = index === active;
    node.style.width = on ? "2.5rem" : "1.5rem";
    node.style.backgroundColor = on ? "#8CC63F" : "rgba(255,255,255,0.35)";
  });
}

function FilmStage({ slides, locale, phone, live = false }) {
  const stageRef = useRef(null);

  useEffect(() => {
    if (!live) return undefined;
    const root = stageRef.current?.parentElement;
    if (!root) return undefined;
    let frame = 0;
    const tick = () => {
      const travel = Math.max(1, root.offsetHeight - window.innerHeight);
      const progress = clamp01(-root.getBoundingClientRect().top / travel);
      applyFilm(stageRef.current, progress);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [live, slides.length]);

  return (
    <div
      ref={stageRef}
      className={
        live
          ? "sticky top-0 h-[100svh] overflow-hidden"
          : "relative h-[100svh] overflow-hidden"
      }
    >
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          data-film-photo={index}
          className="absolute inset-0"
          style={{ opacity: !live || index === 0 ? 1 : 0 }}
        >
          <SafeImage
            src={slide.image}
            alt={t(slide.name, locale)}
            width={1600}
            loading={index === 0 ? "eager" : "lazy"}
            className="h-full w-full object-cover"
          />
        </div>
      ))}
      <div className="pointer-events-none absolute inset-0 bg-[#0A0820]/30" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0A0820] via-[#0A0820]/15 to-transparent" />
      <div className="pointer-events-none absolute inset-0 from-[#0A0820]/85 via-[#0A0820]/20 to-transparent ltr:bg-gradient-to-r rtl:bg-gradient-to-l" />
      <div className="relative z-[3] flex h-full items-end px-4 pt-[calc(var(--navbar-height)+1.5rem)] pb-16 sm:px-6 md:items-center md:pb-20">
        <div className="mx-auto grid w-full max-w-6xl">
          {slides.map((slide, index) => {
            const name = t(slide.name, locale);
            const overview = plainText(t(slide.overview, locale));
            const message = name
              ? `${t(UI.askAgronomistMessage, locale)}\n${name}`
              : t(UI.askAgronomistMessage, locale);
            const waHref = toWhatsAppHref(phone, message);
            return (
              <div
                key={slide.id}
                data-film-copy={index}
                className="col-start-1 row-start-1 max-w-xl"
                style={{ opacity: !live || index === 0 ? 1 : 0 }}
                aria-hidden={live && index !== 0 ? true : undefined}
              >
                <h2 className="font-display text-[clamp(2.25rem,5vw,4rem)] font-black leading-[1.15] text-white">
                  {name}
                </h2>
                {overview ? (
                  <p className="mt-4 line-clamp-2 max-w-lg text-base leading-relaxed text-white/75 md:text-lg">
                    {overview}
                  </p>
                ) : null}
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <SplitArrowButton
                    to={`/products?section=${slide.id}`}
                    className="min-h-10"
                  >
                    {t(UI.nav.products, locale)}
                  </SplitArrowButton>
                  {waHref ? (
                    <SplitArrowButton
                      href={waHref}
                      variant="secondary"
                      className="min-h-10"
                    >
                      {t(UI.askAgronomist, locale)}
                    </SplitArrowButton>
                  ) : null}
                </div>
              </div>
            );
          })}
          {live && slides.length > 1 ? (
            <div className="col-start-1 row-start-2 mt-8 flex items-center gap-2">
              {slides.map((item, tickIndex) => (
                <span
                  key={item.id}
                  data-film-tick={tickIndex}
                  className="block h-0.5 rounded-full bg-white/35"
                  style={{
                    width: tickIndex === 0 ? "2.5rem" : "1.5rem",
                    backgroundColor:
                      tickIndex === 0 ? "#8CC63F" : "rgba(255,255,255,0.35)",
                  }}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function CategoryFilm() {
  const { locale } = useLocale();
  const { contact } = useSiteData();
  const { reducedMotion } = useMotionPrefs();
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

  const slides = useMemo(
    () => buildSlides(categoriesQuery.data, productsQuery.data),
    [categoriesQuery.data, productsQuery.data],
  );
  const phone = contact?.phones?.[0] || "";
  const pinned = !reducedMotion && slides.length > 1;

  if (!slides.length) return null;

  return (
    <section
      data-home-bg="#0A0820"
      className="relative bg-transparent"
      style={pinned ? { height: `${slides.length * 100}svh` } : undefined}
    >
      {pinned ? (
        <FilmStage slides={slides} locale={locale} phone={phone} live />
      ) : (
        slides.map((slide) => (
          <FilmStage
            key={slide.id}
            slides={[slide]}
            locale={locale}
            phone={phone}
          />
        ))
      )}
    </section>
  );
}
