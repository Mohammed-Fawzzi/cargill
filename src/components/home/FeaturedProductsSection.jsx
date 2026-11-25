import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import SafeImage from "@/components/ui/SafeImage";
import { useLocale } from "@/context/LocaleContext";
import { useSiteData } from "@/context/SiteDataContext";
import { getCategories } from "@/services/cms/products";
import { toWhatsAppHref } from "@/lib/phone";
import { t } from "@/lib/i18n";
import { UI } from "@/data/uiCopy";
import { easeOut } from "@/lib/motion";
import useMotionPrefs from "@/hooks/useMotionPrefs";

const MAX_LIST = 6;

export default function FeaturedProductsSection({ section }) {
  const { locale } = useLocale();
  const { contact } = useSiteData();
  const { reducedMotion } = useMotionPrefs();
  const [activeId, setActiveId] = useState("");

  const items = useMemo(
    () => (section?.items || []).filter(Boolean).slice(0, MAX_LIST),
    [section?.items],
  );

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

  if (!items.length) return null;

  return (
    <motion.section
      className="rounded-t-[28px] border-t border-white/8 bg-[#110E33] py-[110px]"
      initial={reducedMotion ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.5, ease: easeOut }}
    >
      <div className="mx-auto max-w-[1320px] px-6">
        <div className="flex items-center gap-4 text-[14px] text-white/70">
          <span>{t(UI.featuredLabel, locale)}</span>
          <span className="h-px flex-1 bg-white/14" aria-hidden="true" />
          <span className="font-mono text-brand-lime" dir="ltr">
            {t(UI.productsIndexLabel, locale)}
          </span>
        </div>

        <div className="mt-11 grid grid-cols-1 items-center gap-10 md:grid-cols-[7fr_5fr] md:gap-14">
          <div className="relative h-[420px] overflow-hidden rounded-[24px] bg-[#0A0820] sm:h-[560px]">
            <AnimatePresence mode="wait" initial={false}>
              {activeName ? (
                <motion.p
                  key={`name-${active?.id}`}
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 top-[60px] z-0 truncate text-center font-display text-[clamp(3.5rem,14vw,9.375rem)] font-black leading-none text-transparent"
                  style={{ WebkitTextStroke: "1px rgba(255,255,255,0.16)" }}
                  initial={reducedMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={reducedMotion ? undefined : { opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {activeName}
                </motion.p>
              ) : null}
            </AnimatePresence>

            <div
              className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_18%,rgba(140,198,63,0.22),transparent_55%)]"
              aria-hidden="true"
            />

            <AnimatePresence mode="wait" initial={false}>
              {active?.imageUrl ? (
                <motion.div
                  key={active.id}
                  className="absolute inset-0 z-10 flex items-center justify-center p-10 sm:p-14"
                  initial={reducedMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={reducedMotion ? undefined : { opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <SafeImage
                    src={active.imageUrl}
                    alt={activeName}
                    width={720}
                    className="max-h-full max-w-[min(100%,420px)] object-contain"
                  />
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          <div>
            <AnimatePresence mode="wait" initial={false}>
              {active ? (
                <motion.div
                  key={active.id}
                  initial={reducedMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={reducedMotion ? undefined : { opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {activeCategory ? (
                    <p className="text-[14px] text-brand-lime">{activeCategory}</p>
                  ) : null}
                  <h3 className="mt-3 font-display text-[clamp(2.25rem,6vw,4rem)] font-black tracking-[-0.01em] text-white">
                    {activeName}
                  </h3>
                  {activeOverview ? (
                    <p className="mt-4 line-clamp-3 text-[19px] leading-[1.7] text-white/72">
                      {activeOverview}
                    </p>
                  ) : null}

                  <div className="mt-7 flex flex-wrap items-center gap-[18px]">
                    <Link
                      to={`/products/${active.id}`}
                      className="rounded-lg bg-brand-lime px-[26px] py-[15px] font-semibold text-[#0A0820] transition-colors hover:bg-brand-lime-hover"
                    >
                      {t(UI.productDetails, locale)} ←
                    </Link>
                    {waHref ? (
                      <a
                        href={waHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="border-b border-brand-lime pb-[3px] text-white transition-colors hover:text-brand-lime"
                      >
                        {t(UI.askAboutWhatsApp, locale)}
                      </a>
                    ) : null}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>

            <div className="mt-11 border-t border-white/12">
              {items.map((item, index) => {
                const name = t(item.name, locale);
                const category = categoryNameById.get(item.sectionId) || "";
                const isActive = item.id === active?.id;
                const number = String(index + 1).padStart(2, "0");

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveId(item.id)}
                    className="row-item flex w-full items-center gap-[18px] border-b border-white/12 py-[18px] text-start text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime"
                    aria-current={isActive ? "true" : undefined}
                  >
                    <span
                      className={`font-mono text-[13px] ${
                        isActive ? "text-brand-lime" : "text-white/50"
                      }`}
                      dir="ltr"
                    >
                      {number}
                    </span>
                    <span
                      className={`flex-1 text-[20px] font-semibold transition-colors ${
                        isActive ? "text-brand-lime" : "text-white hover:text-brand-lime"
                      }`}
                    >
                      {name}
                    </span>
                    {category ? (
                      <span className="text-[14px] text-white/55">{category}</span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
